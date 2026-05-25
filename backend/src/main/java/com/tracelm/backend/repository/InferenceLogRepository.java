package com.tracelm.backend.repository;

import com.tracelm.backend.entity.InferenceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface InferenceLogRepository extends JpaRepository<InferenceLog, UUID> {

    interface InferenceMetricsProjection {
        Long getTotalRequests();
        Double getAvgLatency();
        Long getTotalInputTokens();
        Long getTotalOutputTokens();
        Long getSuccessCount();
    }

    @Query("SELECT COUNT(i) as totalRequests, " +
           "COALESCE(AVG(i.latencyMs), 0.0) as avgLatency, " +
           "COALESCE(SUM(i.inputTokens), 0) as totalInputTokens, " +
           "COALESCE(SUM(i.outputTokens), 0) as totalOutputTokens, " +
           "SUM(CASE WHEN i.status = 'SUCCESS' THEN 1 ELSE 0 END) as successCount " +
           "FROM InferenceLog i")
    InferenceMetricsProjection getOverviewMetrics();

    @Query("SELECT COUNT(i) as totalRequests, " +
           "COALESCE(AVG(i.latencyMs), 0.0) as avgLatency, " +
           "COALESCE(SUM(i.inputTokens), 0) as totalInputTokens, " +
           "COALESCE(SUM(i.outputTokens), 0) as totalOutputTokens, " +
           "SUM(CASE WHEN i.status = 'SUCCESS' THEN 1 ELSE 0 END) as successCount " +
           "FROM InferenceLog i WHERE i.conversationId = :conversationId")
    InferenceMetricsProjection getConversationMetrics(@Param("conversationId") UUID conversationId);

    java.util.List<InferenceLog> findByConversationIdOrderByCreatedAtDesc(UUID conversationId);

    interface ProviderUsageProjection {
        String getName();
        Long getCount();
    }

    @Query("SELECT i.provider as name, COUNT(i) as count FROM InferenceLog i GROUP BY i.provider")
    java.util.List<ProviderUsageProjection> getProviderUsage();

    @Query("SELECT i.model as name, COUNT(i) as count FROM InferenceLog i GROUP BY i.model")
    java.util.List<ProviderUsageProjection> getModelUsage();

    interface LatencyTrendProjection {
        java.util.Date getTimestamp();
        Double getAvgLatency();
    }

    @Query("SELECT cast(i.createdAt as date) as timestamp, AVG(i.latencyMs) as avgLatency FROM InferenceLog i GROUP BY cast(i.createdAt as date) ORDER BY cast(i.createdAt as date) ASC")
    java.util.List<LatencyTrendProjection> getLatencyTrendByDate();
}