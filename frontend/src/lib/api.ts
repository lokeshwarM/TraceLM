import { getToken } from './auth';
import { 
    ChatResponse, 
    MessageResponse, 
    ConversationResponse, 
    MetricsOverviewResponse,
    ConversationMetricsResponse,
    InferenceLogResponse,
    ProviderAnalyticsResponse,
    LatencyTrendResponse,
    MemoryResponse,
    DocumentResponse,
    SourceMetadata
} from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
export const CHAT_BASE_URL = `${API_BASE_URL}/chat`;

if (typeof window !== 'undefined') {
    console.log('[TraceLM] API Base URL resolved to:', API_BASE_URL);
}

async function fetchWithAuth(url: string, options: RequestInit = {}, timeoutMs = 30000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const token = getToken();
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(url, { ...options, headers, signal: controller.signal });
        clearTimeout(id);
        
        if (response.status === 401 || response.status === 403) {
            // Token might be invalid or expired. We could emit an event here to trigger logout.
            console.error('[API] Authentication failed. 401/403 received.');
        }

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

    const response = await fetchWithAuth(`${CHAT_BASE_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    });

    const data = await handleResponse<any>(response);
    return Array.isArray(data) ? data : [data];
}

// Memory APIs
export async function createMemory(conversationId: string): Promise<MemoryResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/memories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
    });

    if (!response.ok) {
        throw new Error(`Failed to create memory: ${response.status}`);
    }

    return response.json();
}

export async function getMemories(): Promise<MemoryResponse[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/memories`);

    if (!response.ok) {
        throw new Error(`Failed to get memories: ${response.status}`);
    }

    return response.json();
}

export async function getMemory(id: string): Promise<MemoryResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/memories/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to get memory: ${response.status}`);
    }

    return response.json();
}

export async function deleteMemory(id: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/memories/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete memory: ${response.status}`);
    }
}

export async function cancelChatRequest(requestId: string): Promise<void> {
    await fetchWithAuth(`${CHAT_BASE_URL}/cancel/${requestId}`, {
        method: 'POST'
    });
}

// Document APIs
export async function uploadDocument(file: File): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // We don't set Content-Type header manually here so the browser can set the multipart boundary automatically
    const token = getToken();
    const headers = new Headers();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        let errorMsg = `Failed to upload document: ${response.status}`;
        try {
            const errorObj = await response.json();
            if (errorObj.message) errorMsg = errorObj.message;
        } catch (e) {
            // Ignore JSON parsing errors
        }
        throw new Error(errorMsg);
    }

    return response.json();
}

export async function getDocuments(): Promise<DocumentResponse[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/documents`);

    if (!response.ok) {
        throw new Error(`Failed to get documents: ${response.status}`);
    }

    return response.json();
}

export async function getDocument(id: string): Promise<DocumentResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/documents/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to get document: ${response.status}`);
    }

    return response.json();
}

export async function deleteDocument(id: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.status}`);
    }
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

    const response = await fetchWithAuth(`${CHAT_BASE_URL}/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal,
    }, 120000);

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
                        if (chunk.status === 'DONE') {
                            await reader.cancel();
                            return;
                        }
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
    onChunk: (data: { content: string, conversationId?: string, inputTokens?: number, outputTokens?: number, model?: string, sources?: SourceMetadata[] }) => void
): Promise<void> {
    const body: Record<string, any> = { prompt, model, requestId };
    if (conversationId) {
        body.conversationId = conversationId;
    }

    const response = await fetchWithAuth(`${CHAT_BASE_URL}/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal,
    }, 120000);

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
                        if (parsed.status === 'DONE') {
                            await reader.cancel();
                            return;
                        }
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
    const response = await fetchWithAuth(`${CHAT_BASE_URL}/conversations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    return handleResponse<ConversationResponse[]>(response);
}

export async function getConversation(id: string): Promise<ConversationResponse> {
    const response = await fetchWithAuth(`${CHAT_BASE_URL}/conversations/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    return handleResponse<ConversationResponse>(response);
}

export async function getMetricsOverview(): Promise<MetricsOverviewResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/metrics/overview`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    return handleResponse<MetricsOverviewResponse>(response);
}

export async function getConversationMetrics(id: string): Promise<ConversationMetricsResponse> {
    const response = await fetchWithAuth(`${CHAT_BASE_URL}/conversations/${id}/metrics`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    return handleResponse<ConversationMetricsResponse>(response);
}

export async function getConversationLogs(id: string): Promise<import('./types').InferenceLogResponse[]> {
    const response = await fetchWithAuth(`${CHAT_BASE_URL}/conversations/${id}/logs`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    return handleResponse<import('./types').InferenceLogResponse[]>(response);
}

export async function getProviderAnalytics(): Promise<import('./types').ProviderAnalyticsResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/metrics/providers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    return handleResponse<import('./types').ProviderAnalyticsResponse>(response);
}

export async function getLatencyTrend(): Promise<import('./types').LatencyTrendResponse[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/metrics/latency`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    return handleResponse<import('./types').LatencyTrendResponse[]>(response);
}

export async function getMe(): Promise<{ id: string, name: string, email: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    
    return handleResponse<{ id: string, name: string, email: string }>(response);
}
