package com.tracelm.backend.service;

import com.tracelm.backend.entity.Conversation;
import com.tracelm.backend.entity.Message;
import com.tracelm.backend.provider.GeminiProvider;
import com.tracelm.backend.repository.ConversationRepository;
import com.tracelm.backend.repository.MessageRepository;
import com.tracelm.backend.repository.InferenceLogRepository;
import com.tracelm.backend.logging.LoggingService;
import com.tracelm.backend.dto.LLMResponse;
import com.tracelm.backend.dto.ConversationResponse;
import com.tracelm.backend.dto.ConversationMetricsResponse;
import com.tracelm.backend.dto.MessageResponse;
import reactor.core.publisher.Flux;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final InferenceLogRepository inferenceLogRepository;
    private final GeminiProvider llmProvider;
    private final LoggingService loggingService;

    public Map<String, String> processMessage(String prompt, UUID conversationId) {

        Conversation conversation;
        if (conversationId != null) {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else {
            conversation = Conversation.builder()
                    .title(prompt.substring(0, Math.min(prompt.length(), 30)))
                    .status("ACTIVE")
                    .build();
            conversationRepository.save(conversation);
        }

        Message userMessage = Message.builder()
                .conversation(conversation)
                .role("USER")
                .content(prompt)
                .build();

        messageRepository.save(userMessage);

        long startTime = System.currentTimeMillis();
        LLMResponse response;
        try {
            response = llmProvider.generateResponse(prompt);
            long latency = System.currentTimeMillis() - startTime;

            loggingService.logInference(
                    conversation.getId(),
                    response.getProvider(),
                    response.getModel(),
                    latency,
                    response.getInputTokens(),
                    response.getOutputTokens(),
                    "SUCCESS"
            );
        } catch (Exception e) {
            loggingService.logInference(
                    conversation.getId(),
                    "Gemini",
                    "gemini-flash-latest",
                    0L,
                    0,
                    0,
                    "FAILED"
            );
            throw new RuntimeException("Failed to generate AI response", e);
        }

        Message assistantMessage = Message.builder()
                .conversation(conversation)
                .role("ASSISTANT")
                .content(response.getContent())
                .build();

        messageRepository.save(assistantMessage);

        return java.util.Map.of(
                "response", response.getContent(),
                "conversationId", conversation.getId().toString()
        );
    }

    public Flux<String> processMessageStream(String prompt, UUID conversationId) {

        Conversation conversation;
        if (conversationId != null) {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else {
            conversation = Conversation.builder()
                    .title(prompt.substring(0, Math.min(prompt.length(), 30)))
                    .status("ACTIVE")
                    .build();
            conversationRepository.save(conversation);
        }

        Message userMessage = Message.builder()
                .conversation(conversation)
                .role("USER")
                .content(prompt)
                .build();

        messageRepository.save(userMessage);

        long startTime = System.currentTimeMillis();
        StringBuilder fullResponse = new StringBuilder();

        return llmProvider.generateStreamResponse(prompt)
                .doOnNext(chunk -> fullResponse.append(chunk))
                .doOnComplete(() -> {
                    long latency = System.currentTimeMillis() - startTime;
                    loggingService.logInference(
                            conversation.getId(),
                            "Gemini",
                            "gemini-flash-latest",
                            latency,
                            0,
                            0,
                            "SUCCESS"
                    );

                    Message assistantMessage = Message.builder()
                            .conversation(conversation)
                            .role("ASSISTANT")
                            .content(fullResponse.toString())
                            .build();

                    messageRepository.save(assistantMessage);
                })
                .doOnError(e -> {
                    loggingService.logInference(
                            conversation.getId(),
                            "Gemini",
                            "gemini-flash-latest",
                            0L,
                            0,
                            0,
                            "FAILED"
                    );
                });
    }

    public List<ConversationResponse> getAllConversations() {
        return conversationRepository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(conversation -> ConversationResponse.builder()
                        .id(conversation.getId())
                        .title(conversation.getTitle())
                        .status(conversation.getStatus())
                        .createdAt(conversation.getCreatedAt())
                        .build())
                .toList();
    }

    public ConversationResponse getConversation(UUID conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        List<MessageResponse> messages =
                messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                        .stream()
                        .map(message -> MessageResponse.builder()
                                .id(message.getId())
                                .role(message.getRole())
                                .content(message.getContent())
                                .createdAt(message.getCreatedAt())
                                .build())
                        .toList();

        return ConversationResponse.builder()
                .id(conversation.getId())
                .title(conversation.getTitle())
                .status(conversation.getStatus())
                .createdAt(conversation.getCreatedAt())
                .messages(messages)
                .build();
    }

    public ConversationMetricsResponse getConversationMetrics(UUID conversationId) {
        var metrics = inferenceLogRepository.getConversationMetrics(conversationId);
        
        long totalRequests = metrics.getTotalRequests() != null ? metrics.getTotalRequests() : 0L;
        double avgLatency = metrics.getAvgLatency() != null ? metrics.getAvgLatency() : 0.0;
        long inputTokens = metrics.getTotalInputTokens() != null ? metrics.getTotalInputTokens() : 0L;
        long outputTokens = metrics.getTotalOutputTokens() != null ? metrics.getTotalOutputTokens() : 0L;
        long successCount = metrics.getSuccessCount() != null ? metrics.getSuccessCount() : 0L;
        
        long totalTokens = inputTokens + outputTokens;
        double successRate = totalRequests > 0 ? ((double) successCount / totalRequests) * 100.0 : 0.0;
        
        return ConversationMetricsResponse.builder()
                .inputTokens(inputTokens)
                .outputTokens(outputTokens)
                .totalTokens(totalTokens)
                .avgLatency(Math.round(avgLatency * 100.0) / 100.0)
                .requestCount(totalRequests)
                .successRate(Math.round(successRate * 100.0) / 100.0)
                .build();
    }
}