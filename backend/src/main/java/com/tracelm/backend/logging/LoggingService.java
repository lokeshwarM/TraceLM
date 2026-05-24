package com.tracelm.backend.logging;

import java.util.UUID;
import com.tracelm.backend.entity.InferenceLog;
import com.tracelm.backend.repository.InferenceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoggingService {

    private final InferenceLogRepository inferenceLogRepository;

    public void logInference(
            UUID conversationId,
            String provider,
            String model,
            Long latencyMs,
            Integer inputTokens,
            Integer outputTokens,
            String status
    ) {

        InferenceLog log = InferenceLog.builder()
                .conversationId(conversationId)
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