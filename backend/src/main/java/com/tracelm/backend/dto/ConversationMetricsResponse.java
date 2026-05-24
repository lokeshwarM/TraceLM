package com.tracelm.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConversationMetricsResponse {
    private long inputTokens;
    private long outputTokens;
    private long totalTokens;
    private double avgLatency;
    private long requestCount;
    private double successRate;
}
