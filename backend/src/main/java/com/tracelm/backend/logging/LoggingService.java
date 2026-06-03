package com.tracelm.backend.logging;

import java.util.UUID;
import com.tracelm.backend.entity.User;
import com.tracelm.backend.entity.InferenceLog;
import com.tracelm.backend.repository.InferenceLogRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoggingService {

    private final InferenceLogRepository inferenceLogRepository;

    @PostConstruct
    public void init() {
        try {
            inferenceLogRepository.backfillUserIds();
        } catch (Exception e) {
            System.err.println("Failed to backfill user IDs in InferenceLog: " + e.getMessage());
        }
    }

    public void logInference(
            UUID conversationId,
            User user,
            String provider,
            String model,
            Long latencyMs,
            Integer inputTokens,
            Integer outputTokens,
            String status
    ) {

        InferenceLog log = InferenceLog.builder()
                .conversationId(conversationId)
                .user(user)
                .provider(provider)
                .model(model)
                .latencyMs(latencyMs)
                .inputTokens(inputTokens)
                .outputTokens(outputTokens)
                .status(status)
                .build();

        inferenceLogRepository.save(log);
    }
}