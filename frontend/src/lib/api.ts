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

export async function sendMessage(prompt: string, conversationId?: string | null): Promise<ChatResponse> {
    const request: ChatRequest = { prompt, conversationId };

    const response = await fetchWithTimeout(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    return handleResponse<ChatResponse>(response);
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
