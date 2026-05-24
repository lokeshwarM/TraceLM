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
}