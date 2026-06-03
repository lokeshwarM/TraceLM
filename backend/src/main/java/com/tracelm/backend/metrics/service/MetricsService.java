package com.tracelm.backend.metrics.service;

import com.tracelm.backend.metrics.dto.MetricsOverviewResponse;
import com.tracelm.backend.repository.ConversationRepository;
import com.tracelm.backend.repository.InferenceLogRepository;
import com.tracelm.backend.entity.User;
import com.tracelm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final ConversationRepository conversationRepository;
    private final InferenceLogRepository inferenceLogRepository;
    private final UserRepository userRepository;

    public MetricsOverviewResponse getOverview(String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        long totalConversations = conversationRepository.countByUserId(userId);
        var metrics = inferenceLogRepository.getOverviewMetrics(userId);
        
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

    public com.tracelm.backend.metrics.dto.ProviderAnalyticsResponse getProviders(String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        var providers = inferenceLogRepository.getProviderUsage(userId).stream()
                .map(p -> new com.tracelm.backend.metrics.dto.ProviderUsageResponse(p.getName(), p.getCount()))
                .toList();
        var models = inferenceLogRepository.getModelUsage(userId).stream()
                .map(m -> new com.tracelm.backend.metrics.dto.ProviderUsageResponse(m.getName(), m.getCount()))
                .toList();
        return new com.tracelm.backend.metrics.dto.ProviderAnalyticsResponse(providers, models);
    }

    public java.util.List<com.tracelm.backend.metrics.dto.LatencyTrendResponse> getLatency(String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        return inferenceLogRepository.getLatencyTrendByDate(userId).stream()
                .map(l -> new com.tracelm.backend.metrics.dto.LatencyTrendResponse(
                        l.getTimestamp().toString(),
                        Math.round(l.getAvgLatency() * 100.0) / 100.0))
                .toList();
    }
}
