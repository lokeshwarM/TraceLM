import { ChatRequest, ChatResponse, ConversationResponse, MetricsOverviewResponse, ConversationMetricsResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err: unknown) {
        clearTimeout(id);
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Network request timed out. Please check your connection.');
        }
        if (err instanceof Error && err.message.includes('Failed to fetch')) {
            throw new Error('Network error. Backend is unreachable.');
        }
        throw err;
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
        if (response.status === 503) throw new Error('Service unavailable. The backend is currently down.');
        if (response.status === 504) throw new Error('Request timed out. Please try again.');
        if (response.status >= 500) throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export async function sendMessage(prompt: string, conversationId: string | null = null, modelOrModels: string | string[] = 'gemini-3.1-flash-lite'): Promise<ChatResponse[]> {
    const body: Record<string, any> = { prompt };
    
    if (Array.isArray(modelOrModels)) {
        body.models = modelOrModels;
        if (modelOrModels.length === 1) {
            body.model = modelOrModels[0];
        }
    } else {
        body.model = modelOrModels;
    }
    
    if (conversationId) {
        body.conversationId = conversationId;
    }

    const response = await fetchWithTimeout(`${BASE_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const data = await handleResponse<any>(response);
    return Array.isArray(data) ? data : [data];
}

export async function cancelChatRequest(requestId: string): Promise<void> {
    await fetch(`${BASE_URL}/cancel/${requestId}`, {
        method: 'POST'
    });
}

export interface CompareResponseChunk {
    model: string;
    content: string;
    latency?: number;
    inputTokens?: number;
    outputTokens?: number;
    status: string;
    errorMessage?: string;
    conversationId?: string;
}

export async function streamCompareMessages(
    prompt: string, 
    conversationId: string | null = null, 
    models: string[],
    requestId: string,
    signal: AbortSignal,
    onChunk: (chunk: CompareResponseChunk) => void
): Promise<void> {
    const body: Record<string, any> = { prompt, models, requestId };
    if (conversationId) {
        body.conversationId = conversationId;
    }

    const response = await fetch(`${BASE_URL}/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
    });

    if (!response.ok || !response.body) {
        throw new Error('Failed to start compare stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let rawBuffer = '';
    // Accumulate data: fields within a single SSE event block
    let eventDataLines: string[] = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        rawBuffer += decoder.decode(value, { stream: true });

        // Split on newlines, keep the incomplete last piece in rawBuffer
        const lines = rawBuffer.split('\n');
        rawBuffer = lines.pop() ?? '';

        for (const line of lines) {
            const trimmed = line.trimEnd(); // preserve leading content

            if (trimmed === '') {
                // Blank line = end of one SSE event — process accumulated data lines
                if (eventDataLines.length > 0) {
                    const rawData = eventDataLines.join('\n').trim();
                    eventDataLines = [];
                    if (!rawData) continue;
                    console.log('[SSE] Received payload:', rawData);
                    try {
                        const chunk = JSON.parse(rawData) as CompareResponseChunk;
                        onChunk(chunk);
                    } catch (e) {
                        console.error('[SSE] Failed to parse compare chunk:', e, 'raw:', rawData);
                    }
                }
            } else if (trimmed.startsWith('data:')) {
                // Strip the "data:" prefix and accumulate
                eventDataLines.push(trimmed.slice(5).trimStart());
            }
            // Ignore "event:", "id:", "retry:" lines
        }
    }

    // Flush any trailing event if stream ended without blank line
    if (eventDataLines.length > 0) {
        const rawData = eventDataLines.join('\n').trim();
        if (rawData) {
            console.log('[SSE] Received final trailing payload:', rawData);
            try {
                const chunk = JSON.parse(rawData) as CompareResponseChunk;
                onChunk(chunk);
            } catch (e) {
                console.error('[SSE] Failed to parse trailing compare chunk:', e, 'raw:', rawData);
            }
        }
    }
}

export async function streamMessage(
    prompt: string, 
    conversationId: string | null = null, 
    model: string,
    requestId: string,
    signal: AbortSignal,
    onChunk: (data: { content: string, conversationId?: string, inputTokens?: number, outputTokens?: number, model?: string }) => void
): Promise<void> {
    const body: Record<string, any> = { prompt, model, requestId };
    if (conversationId) {
        body.conversationId = conversationId;
    }

    const response = await fetch(`${BASE_URL}/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
    });

    if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let rawBuffer = '';
    let eventDataLines: string[] = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        rawBuffer += decoder.decode(value, { stream: true });
        const lines = rawBuffer.split('\n');
        rawBuffer = lines.pop() ?? '';

        for (const line of lines) {
            const trimmed = line.trimEnd();
            if (trimmed === '') {
                if (eventDataLines.length > 0) {
                    const rawData = eventDataLines.join('\n').trim();
                    eventDataLines = [];
                    if (!rawData) continue;
                    try {
                        const parsed = JSON.parse(rawData);
                        if (parsed && typeof parsed.content === 'string') {
                            onChunk({ 
                                content: parsed.content, 
                                conversationId: parsed.conversationId,
                                inputTokens: parsed.inputTokens,
                                outputTokens: parsed.outputTokens,
                                model: parsed.model
                            });
                        } else {
                            onChunk({ content: rawData });
                        }
                    } catch {
                        onChunk({ content: rawData });
                    }
                }
            } else if (trimmed.startsWith('data:')) {
                eventDataLines.push(trimmed.slice(5).trimStart());
            }
        }
    }
    
    if (eventDataLines.length > 0) {
        const rawData = eventDataLines.join('\n').trim();
        if (rawData) {
            try {
                const parsed = JSON.parse(rawData);
                if (parsed && typeof parsed.content === 'string') {
                    onChunk({ 
                        content: parsed.content, 
                        conversationId: parsed.conversationId,
                        inputTokens: parsed.inputTokens,
                        outputTokens: parsed.outputTokens,
                        model: parsed.model
                    });
                } else {
                    onChunk({ content: rawData });
                }
            } catch {
                onChunk({ content: rawData });
            }
        }
    }
}

export async function getConversations(): Promise<ConversationResponse[]> {
    const response = await fetchWithTimeout(`${BASE_URL}/conversations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<ConversationResponse[]>(response);
}

export async function getConversation(id: string): Promise<ConversationResponse> {
    const response = await fetchWithTimeout(`${BASE_URL}/conversations/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<ConversationResponse>(response);
}

export async function getMetricsOverview(): Promise<MetricsOverviewResponse> {
    const baseUrlFormatted = BASE_URL.replace(/\/chat\/?$/, '');
    const response = await fetchWithTimeout(`${baseUrlFormatted}/metrics/overview`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<MetricsOverviewResponse>(response);
}

export async function getConversationMetrics(id: string): Promise<ConversationMetricsResponse> {
    const response = await fetchWithTimeout(`${BASE_URL}/conversations/${id}/metrics`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<ConversationMetricsResponse>(response);
}

export async function getConversationLogs(id: string): Promise<import('./types').InferenceLogResponse[]> {
    const response = await fetchWithTimeout(`${BASE_URL}/conversations/${id}/logs`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<import('./types').InferenceLogResponse[]>(response);
}

export async function getProviderAnalytics(): Promise<import('./types').ProviderAnalyticsResponse> {
    const baseUrlFormatted = BASE_URL.replace(/\/chat\/?$/, '');
    const response = await fetchWithTimeout(`${baseUrlFormatted}/metrics/providers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<import('./types').ProviderAnalyticsResponse>(response);
}

export async function getLatencyTrend(): Promise<import('./types').LatencyTrendResponse[]> {
    const baseUrlFormatted = BASE_URL.replace(/\/chat\/?$/, '');
    const response = await fetchWithTimeout(`${baseUrlFormatted}/metrics/latency`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<import('./types').LatencyTrendResponse[]>(response);
}
