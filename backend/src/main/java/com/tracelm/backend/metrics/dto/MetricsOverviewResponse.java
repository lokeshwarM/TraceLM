package com.tracelm.backend.metrics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MetricsOverviewResponse {
    private long totalRequests;
    private double avgLatency;
    private long totalConversations;
    private long totalTokens;
    private double successRate;
}
