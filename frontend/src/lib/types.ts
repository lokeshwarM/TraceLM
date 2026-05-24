export interface ChatRequest {
    prompt: string;
}

export interface ChatResponse {
    response: string;
}

export interface MessageResponse {
    id: string;
    role: string;
    content: string;
    createdAt: string;
}

export interface ConversationResponse {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    messages?: MessageResponse[];
}
