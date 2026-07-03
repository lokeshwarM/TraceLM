export interface ChatRequest {
    prompt: string;
    conversationId?: string | null;
}

export interface ChatResponse {
    response: string;
    conversationId?: string;
    model?: string;
}

export interface MessageResponse {
    id: string;
    role: string;
    content: string;
    createdAt: string;
    piiRedacted?: boolean;
    sources?: SourceMetadata[];
}

export interface SourceMetadata {
    documentName: string;
    pageNumber: number;
    similarityScore: number;
    chunkId: string;
    documentId: string;
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
    memoryUsed?: number;
    memoryMax?: number;
    memoryRemaining?: number;
    windowExceeded?: boolean;
}

export interface InferenceLogResponse {
    provider: string;
    model: string;
    latencyMs: number;
    inputTokens: number;
    outputTokens: number;
    status: string;
    createdAt: string;
}

export interface ProviderUsageResponse {
    name: string;
    count: number;
}

export interface ProviderAnalyticsResponse {
    providers: ProviderUsageResponse[];
    models: ProviderUsageResponse[];
}

export interface LatencyTrendResponse {
    timestamp: string;
    avgLatency: number;
}

export interface MemoryResponse {
    id: string;
    title: string;
    summary: string;
    sourceConversationId: string;
    messageCount: number;
    tokenCount: number;
    lastMessageAt: string;
    pinned: boolean;
    createdAt: string;
}

export interface DocumentResponse {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    pageCount?: number;
    chunkCount: number;
    extractedText?: string;
    documentStatus: string;
    uploadedAt: string;
}

export interface JobSearchRequest {
    keyword?: string;
    location?: string;
    experience?: string;
    remoteOnly?: boolean;
    page?: number;
    pageSize?: number;
}

export interface JobListing {
    jobId: string;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    experienceLevel: string;
    salary: string;
    jobUrl: string;
    provider: string;
    description: string;
    postedDate: string;
}

