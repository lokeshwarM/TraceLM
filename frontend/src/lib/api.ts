import { ChatRequest, ChatResponse, ConversationResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export async function sendMessage(prompt: string, conversationId?: string | null): Promise<ChatResponse> {
    const request: ChatRequest = { prompt, conversationId };

    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    return handleResponse<ChatResponse>(response);
}

export async function getConversations(): Promise<ConversationResponse[]> {
    const response = await fetch(`${BASE_URL}/conversations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<ConversationResponse[]>(response);
}

export async function getConversation(id: string): Promise<ConversationResponse> {
    const response = await fetch(`${BASE_URL}/conversations/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return handleResponse<ConversationResponse>(response);
}
