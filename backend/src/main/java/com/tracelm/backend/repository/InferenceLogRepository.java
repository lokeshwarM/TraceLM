package com.tracelm.backend.repository;

import com.tracelm.backend.entity.InferenceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

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
           "FROM InferenceLog i WHERE i.user.id = :userId")
    InferenceMetricsProjection getOverviewMetrics(@Param("userId") UUID userId);

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

    @Query("SELECT i.provider as name, COUNT(i) as count FROM InferenceLog i WHERE i.user.id = :userId GROUP BY i.provider")
    java.util.List<ProviderUsageProjection> getProviderUsage(@Param("userId") UUID userId);

    @Query("SELECT i.model as name, COUNT(i) as count FROM InferenceLog i WHERE i.user.id = :userId GROUP BY i.model")
    java.util.List<ProviderUsageProjection> getModelUsage(@Param("userId") UUID userId);

    interface LatencyTrendProjection {
        java.util.Date getTimestamp();
        Double getAvgLatency();
    }

    @Query("SELECT cast(i.createdAt as date) as timestamp, AVG(i.latencyMs) as avgLatency FROM InferenceLog i WHERE i.user.id = :userId GROUP BY cast(i.createdAt as date) ORDER BY cast(i.createdAt as date) ASC")
    java.util.List<LatencyTrendProjection> getLatencyTrendByDate(@Param("userId") UUID userId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE inference_logs SET user_id = c.user_id FROM conversations c WHERE inference_logs.conversation_id = c.id AND inference_logs.user_id IS NULL", nativeQuery = true)
    void backfillUserIds();
}