export interface ChatRequest {
    prompt: string;
    conversationId?: string | null;
}

export interface ChatResponse {
    response: string;
    conversationId?: string;
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

export interface MetricsOverviewResponse {
    totalRequests: number;
    avgLatency: number;
    totalConversations: number;
    totalTokens: number;
    successRate: number;
}

export interface ConversationMetricsResponse {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    avgLatency: number;
    requestCount: number;
    successRate: number;
}
