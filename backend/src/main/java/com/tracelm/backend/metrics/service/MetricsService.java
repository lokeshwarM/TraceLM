package com.tracelm.backend.metrics.service;

import com.tracelm.backend.metrics.dto.MetricsOverviewResponse;
import com.tracelm.backend.repository.ConversationRepository;
import com.tracelm.backend.repository.InferenceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final ConversationRepository conversationRepository;
    private final InferenceLogRepository inferenceLogRepository;

    public MetricsOverviewResponse getOverview() {
        long totalConversations = conversationRepository.count();
        var metrics = inferenceLogRepository.getOverviewMetrics();
        
        long totalRequests = metrics.getTotalRequests() != null ? metrics.getTotalRequests() : 0L;
        double avgLatency = metrics.getAvgLatency() != null ? metrics.getAvgLatency() : 0.0;
        long inputTokens = metrics.getTotalInputTokens() != null ? metrics.getTotalInputTokens() : 0L;
        long outputTokens = metrics.getTotalOutputTokens() != null ? metrics.getTotalOutputTokens() : 0L;
        long successCount = metrics.getSuccessCount() != null ? metrics.getSuccessCount() : 0L;
        
        long totalTokens = inputTokens + outputTokens;
        
        double successRate = totalRequests > 0 ? ((double) successCount / totalRequests) * 100.0 : 0.0;
        
        return MetricsOverviewResponse.builder()
                .totalRequests(totalRequests)
                .avgLatency(Math.round(avgLatency * 100.0) / 100.0) // Round to 2 decimal places
                .totalConversations(totalConversations)
                .totalTokens(totalTokens)
                .successRate(Math.round(successRate * 100.0) / 100.0)
                .build();
    }

    public com.tracelm.backend.metrics.dto.ProviderAnalyticsResponse getProviders() {
        var providers = inferenceLogRepository.getProviderUsage().stream()
                .map(p -> new com.tracelm.backend.metrics.dto.ProviderUsageResponse(p.getName(), p.getCount()))
                .toList();
        var models = inferenceLogRepository.getModelUsage().stream()
                .map(m -> new com.tracelm.backend.metrics.dto.ProviderUsageResponse(m.getName(), m.getCount()))
                .toList();
        return new com.tracelm.backend.metrics.dto.ProviderAnalyticsResponse(providers, models);
    }

    public java.util.List<com.tracelm.backend.metrics.dto.LatencyTrendResponse> getLatency() {
        return inferenceLogRepository.getLatencyTrendByDate().stream()
                .map(l -> new com.tracelm.backend.metrics.dto.LatencyTrendResponse(
                        l.getTimestamp().toString(),
                        Math.round(l.getAvgLatency() * 100.0) / 100.0))
                .toList();
    }
}
