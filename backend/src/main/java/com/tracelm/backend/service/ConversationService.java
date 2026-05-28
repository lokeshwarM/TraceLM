package com.tracelm.backend.service;

import com.tracelm.backend.entity.Conversation;
import com.tracelm.backend.entity.Message;
import com.tracelm.backend.entity.User;
import com.tracelm.backend.provider.GeminiProvider;
import com.tracelm.backend.repository.ConversationRepository;
import com.tracelm.backend.repository.MessageRepository;
import com.tracelm.backend.repository.UserRepository;
import com.tracelm.backend.repository.InferenceLogRepository;
import com.tracelm.backend.logging.LoggingService;
import com.tracelm.backend.dto.LLMResponse;
import com.tracelm.backend.dto.ConversationResponse;
import com.tracelm.backend.dto.ConversationMetricsResponse;
import com.tracelm.backend.dto.MessageResponse;
import com.tracelm.backend.dto.InferenceLogResponse;
import reactor.core.publisher.Flux;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import reactor.core.publisher.Sinks;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.tracelm.backend.service.PiiRedactionService;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final InferenceLogRepository inferenceLogRepository;
    private final GeminiProvider llmProvider;
    private final LoggingService loggingService;
    private final PiiRedactionService piiRedactionService;
    private final PiiPipelineService piiPipelineService;

    private static final int MAX_CONTEXT_TOKENS = 15000;
    private static final int SAFE_CONTEXT_LIMIT = 13000;

    private final ConcurrentHashMap<String, Sinks.One<Void>> activeRequests = new ConcurrentHashMap<>();

    public void cancelRequest(String requestId) {
        if (requestId == null) return;
        Sinks.One<Void> sink = activeRequests.remove(requestId);
        if (sink != null) {
            sink.tryEmitEmpty();
        }
    }

    public Map<String, String> processMessage(String prompt, UUID conversationId, String model, String userId) {

        Conversation conversation;
        if (conversationId != null) {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.getUser().getId().toString().equals(userId)) throw new RuntimeException("Unauthorized");
        } else {
            
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            conversation = Conversation.builder()
                    .title(prompt.substring(0, Math.min(prompt.length(), 30)))
                    .status("ACTIVE")
                    .user(user)
                    .build();

            conversationRepository.save(conversation);
        }

        String sanitizedPrompt = piiRedactionService.sanitize(prompt);
        boolean redacted = !prompt.equals(sanitizedPrompt);
        Message userMessage = Message.builder()
                .conversation(conversation)
                .role("USER")
                .content(sanitizedPrompt)
                .piiRedacted(redacted)
                .build();

        messageRepository.save(userMessage);

        MemoryContextResult memory = buildMemoryContext(conversation.getId());
        List<Message> contextMessages = memory.messages;

        long startTime = System.currentTimeMillis();
        LLMResponse response;
        try {
            response = llmProvider.generateResponse(contextMessages, model);
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
            String fallbackModel = (model != null && !model.trim().isEmpty()) ? model : "gemini-3.1-flash-lite";
            loggingService.logInference(
                    conversation.getId(),
                    "Gemini",
                    fallbackModel,
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
                "conversationId", conversation.getId().toString(),
                "model", response.getModel()
        );
    }

    public List<Map<String, String>> processMessages(String prompt, UUID conversationId, List<String> models, String userId) {
        Conversation conversation;
        if (conversationId != null) {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.getUser().getId().toString().equals(userId)) throw new RuntimeException("Unauthorized");
        } else {
            
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            conversation = Conversation.builder()
                    .title(prompt.substring(0, Math.min(prompt.length(), 30)))
                    .status("ACTIVE")
                    .user(user)
                    .build();

            conversationRepository.save(conversation);
        }

        String sanitizedPrompt = piiRedactionService.sanitize(prompt);
        boolean redacted = !prompt.equals(sanitizedPrompt);
        Message userMessage = Message.builder()
                .conversation(conversation)
                .role("USER")
                .content(sanitizedPrompt)
                .piiRedacted(redacted)
                .build();
        messageRepository.save(userMessage);

        MemoryContextResult memory = buildMemoryContext(conversation.getId());
        List<Message> contextMessages = memory.messages;

        return Flux.fromIterable(models)
                .flatMap(model -> reactor.core.publisher.Mono.fromCallable(() -> {
                    long startTime = System.currentTimeMillis();
                    LLMResponse response;
                    try {
                        response = llmProvider.generateResponse(contextMessages, model);
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
                        String fallbackModel = (model != null && !model.trim().isEmpty()) ? model : "gemini-3.1-flash-lite";
                        loggingService.logInference(
                                conversation.getId(),
                                "Gemini",
                                fallbackModel,
                                0L,
                                0,
                                0,
                                "FAILED"
                        );
                        response = LLMResponse.builder()
                                .provider("Gemini")
                                .model(fallbackModel)
                                .content("Error generating response.")
                                .build();
                    }

                    Message assistantMessage = Message.builder()
                            .conversation(conversation)
                            .role("ASSISTANT")
                            .content(response.getContent())
                            .build();

                    messageRepository.save(assistantMessage);

                    return Map.of(
                            "response", response.getContent(),
                            "conversationId", conversation.getId().toString(),
                            "model", response.getModel()
                    );
                }).subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic()))
                .collectList()
                .block();
    }

    public Flux<LLMResponse> processMessageStream(String prompt, UUID conversationId, String model, String requestId, String userId) {

        Conversation conversation;
        if (conversationId != null) {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.getUser().getId().toString().equals(userId)) throw new RuntimeException("Unauthorized");
        } else {
            
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            conversation = Conversation.builder()
                    .title(prompt.substring(0, Math.min(prompt.length(), 30)))
                    .status("ACTIVE")
                    .user(user)
                    .build();

            conversationRepository.save(conversation);
        }

        String sanitizedPrompt = piiRedactionService.sanitize(prompt);
        boolean redacted = !prompt.equals(sanitizedPrompt);
        Message userMessage = Message.builder()
                .conversation(conversation)
                .role("USER")
                .content(sanitizedPrompt)
                .piiRedacted(redacted)
                .build();

        messageRepository.save(userMessage);

        MemoryContextResult memory = buildMemoryContext(conversation.getId());
        List<Message> contextMessages = memory.messages;

        long startTime = System.currentTimeMillis();
        StringBuilder fullResponse = new StringBuilder();

        String selectedModel = normalizeModel(model);
        
        Sinks.One<Void> cancelSink = null;
        if (requestId != null && !requestId.trim().isEmpty()) {
            cancelSink = Sinks.one();
            activeRequests.put(requestId, cancelSink);
        }

        Flux<LLMResponse> stream = llmProvider.generateStreamResponse(contextMessages, model);
        
        if (cancelSink != null) {
            stream = stream.takeUntilOther(cancelSink.asMono());
        }

        int[] tokenCounts = new int[]{0, 0}; // [input, output]

        return stream
                .doOnNext(chunk -> {
                    chunk.setConversationId(conversation.getId().toString());
                    fullResponse.append(chunk.getContent());
                    if (chunk.getInputTokens() != null && chunk.getInputTokens() > 0) {
                        tokenCounts[0] = chunk.getInputTokens();
                    }
                    if (chunk.getOutputTokens() != null && chunk.getOutputTokens() > 0) {
                        tokenCounts[1] = chunk.getOutputTokens();
                    }
                })
                .doOnComplete(() -> {
                    System.out.println("[STREAM] doOnComplete triggered");
                    try {
                        if (requestId != null) activeRequests.remove(requestId);
                        long latency = System.currentTimeMillis() - startTime;
                        loggingService.logInference(
                                conversation.getId(),
                                "Gemini",
                                selectedModel,
                                latency,
                                tokenCounts[0],
                                tokenCounts[1],
                                "SUCCESS"
                        );

                        Message assistantMessage = Message.builder()
                                .conversation(conversation)
                                .role("ASSISTANT")
                                .content(fullResponse.toString())
                                .build();

                        messageRepository.save(assistantMessage);
                        System.out.println("[STREAM] Saved message successfully");
                    } catch (Exception e) {
                        System.err.println("[STREAM] Error in doOnComplete: " + e.getMessage());
                        e.printStackTrace();
                    }
                })
                .doOnError(e -> {
                    loggingService.logInference(
                            conversation.getId(),
                            "Gemini",
                            selectedModel,
                            0L,
                            0,
                            0,
                            "FAILED"
                    );
                })
                .doOnCancel(() -> {
                    if (requestId != null) activeRequests.remove(requestId);
                    loggingService.logInference(
                            conversation.getId(), "Gemini", selectedModel, 0L, 0, 0, "CANCELLED"
                    );
                    System.out.println("[STREAM] doOnCancel triggered");
                })
                .doFinally(signalType -> {
                    System.out.println("[STREAM] doFinally triggered with signal: " + signalType);
                });
    }

    public Flux<com.tracelm.backend.dto.CompareResponseChunk> processCompareStream(String prompt, UUID conversationId, List<String> models, String requestId, String userId) {
        Conversation conversation;
        if (conversationId != null) {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.getUser().getId().toString().equals(userId)) throw new RuntimeException("Unauthorized");
        } else {
            
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            conversation = Conversation.builder()
                    .title(prompt.substring(0, Math.min(prompt.length(), 30)))
                    .status("ACTIVE")
                    .user(user)
                    .build();

            conversationRepository.save(conversation);
        }

        String sanitizedPrompt = piiRedactionService.sanitize(prompt);
        boolean redacted = !prompt.equals(sanitizedPrompt);
        Message userMessage = Message.builder()
                .conversation(conversation)
                .role("USER")
                .content(sanitizedPrompt)
                .piiRedacted(redacted)
                .build();
        messageRepository.save(userMessage);

        MemoryContextResult memory = buildMemoryContext(conversation.getId());
        List<Message> contextMessages = memory.messages;

        Sinks.One<Void> cancelSink = null;
        if (requestId != null && !requestId.trim().isEmpty()) {
            cancelSink = Sinks.one();
            activeRequests.put(requestId, cancelSink);
        }

        Flux<com.tracelm.backend.dto.CompareResponseChunk> stream = Flux.fromIterable(models)
                .flatMap(model -> reactor.core.publisher.Mono.fromCallable(() -> {
                    String selectedModel = normalizeModel(model);
                    long startTime = System.currentTimeMillis();
                    
                    try {
                        com.tracelm.backend.dto.LLMResponse response = llmProvider.generateResponse(contextMessages, model);
                        long latency = System.currentTimeMillis() - startTime;

                        loggingService.logInference(
                                conversation.getId(), "Gemini", selectedModel, latency,
                                response.getInputTokens(), response.getOutputTokens(), "SUCCESS"
                        );

                        Message assistantMessage = Message.builder()
                                .conversation(conversation)
                                .role("ASSISTANT")
                                .content(response.getContent())
                                .build();
                        messageRepository.save(assistantMessage);

                        return com.tracelm.backend.dto.CompareResponseChunk.builder()
                                .model(selectedModel)
                                .content(response.getContent())
                                .latency(latency)
                                .inputTokens(response.getInputTokens())
                                .outputTokens(response.getOutputTokens())
                                .status("SUCCESS")
                                .conversationId(conversation.getId().toString())
                                .build();
                    } catch (Exception e) {
                        loggingService.logInference(
                                conversation.getId(), "Gemini", selectedModel, 0L, 0, 0, "FAILED"
                        );
                        return com.tracelm.backend.dto.CompareResponseChunk.builder()
                                .model(selectedModel)
                                .content("")
                                .status("FAILED")
                                .errorMessage(e.getMessage())
                                .conversationId(conversation.getId().toString())
                                .build();
                    }
                }).subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic()));
                
        if (cancelSink != null) {
            stream = stream.takeUntilOther(cancelSink.asMono());
        }
        
        return stream
                .doOnComplete(() -> {
                    if (requestId != null) activeRequests.remove(requestId);
                })
                .doOnCancel(() -> {
                    if (requestId != null) activeRequests.remove(requestId);
                });
    }

    public List<ConversationResponse> getAllConversations(String userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(UUID.fromString(userId))
                .stream()
                .map(conversation -> ConversationResponse.builder()
                        .id(conversation.getId())
                        .title(conversation.getTitle())
                        .status(conversation.getStatus())
                        .createdAt(conversation.getCreatedAt())
                        .build())
                .toList();
    }

    public ConversationResponse getConversation(UUID conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conversation.getUser().getId().toString().equals(userId)) throw new RuntimeException("Unauthorized");

        List<MessageResponse> messages =
                messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                        .stream()
                        .map(message -> MessageResponse.builder()
                                .id(message.getId())
                                .role(message.getRole())
                                .content(message.getContent())
                                .createdAt(message.getCreatedAt())
                                .piiRedacted(message.isPiiRedacted())
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

    public ConversationMetricsResponse getConversationMetrics(UUID conversationId, String userId) {
        var metrics = inferenceLogRepository.getConversationMetrics(conversationId);
        
        long totalRequests = metrics.getTotalRequests() != null ? metrics.getTotalRequests() : 0L;
        double avgLatency = metrics.getAvgLatency() != null ? metrics.getAvgLatency() : 0.0;
        long inputTokens = metrics.getTotalInputTokens() != null ? metrics.getTotalInputTokens() : 0L;
        long outputTokens = metrics.getTotalOutputTokens() != null ? metrics.getTotalOutputTokens() : 0L;
        long successCount = metrics.getSuccessCount() != null ? metrics.getSuccessCount() : 0L;
        
        long totalTokens = inputTokens + outputTokens;
        double successRate = totalRequests > 0 ? ((double) successCount / totalRequests) * 100.0 : 0.0;
        
        MemoryContextResult memory = buildMemoryContext(conversationId);
        
        return ConversationMetricsResponse.builder()
                .inputTokens(inputTokens)
                .outputTokens(outputTokens)
                .totalTokens(totalTokens)
                .avgLatency(Math.round(avgLatency * 100.0) / 100.0)
                .requestCount(totalRequests)
                .successRate(Math.round(successRate * 100.0) / 100.0)
                .memoryUsed(memory.usedTokens)
                .memoryMax(MAX_CONTEXT_TOKENS)
                .memoryRemaining(Math.max(0, MAX_CONTEXT_TOKENS - memory.usedTokens))
                .windowExceeded(memory.windowExceeded)
                .build();
    }

    public List<InferenceLogResponse> getConversationLogs(UUID conversationId, String userId) {
        return inferenceLogRepository.findByConversationIdOrderByCreatedAtDesc(conversationId)
                .stream()
                .map(log -> InferenceLogResponse.builder()
                        .provider(log.getProvider())
                        .model(log.getModel())
                        .latencyMs(log.getLatencyMs())
                        .inputTokens(log.getInputTokens())
                        .outputTokens(log.getOutputTokens())
                        .status(log.getStatus())
                        .createdAt(log.getCreatedAt())
                        .build())
                .toList();
    }

    private String normalizeModel(String requestedModel) {
        if (requestedModel == null || requestedModel.trim().isEmpty()) {
            return "gemini-3.1-flash-lite";
        }
        switch (requestedModel.toLowerCase()) {
            case "gemma-4-26b":
                return "gemma-4-26b-a4b-it";
            case "gemma-4-31b":
                return "gemma-4-31b-it";
            case "gemini-3.1-flash-lite":
                return "gemini-3.1-flash-lite";
            default:
                return "gemini-3.1-flash-lite";
        }
    }

    private MemoryContextResult buildMemoryContext(UUID conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        
        long usedTokens = 0;
        boolean windowExceeded = false;
        
        List<Message> contextMessages = new java.util.ArrayList<>();
        
        for (int i = messages.size() - 1; i >= 0; i--) {
            Message msg = messages.get(i);
            String content = msg.getContent() != null ? msg.getContent() : "";
            int tokens = content.length() / 4;
            int roughOverhead = 4; // structural padding roughly equivalent to tokens
            int totalMsgTokens = tokens + roughOverhead;
            
            if (usedTokens + totalMsgTokens <= SAFE_CONTEXT_LIMIT) {
                usedTokens += totalMsgTokens;
                contextMessages.add(0, msg); // prepend to preserve ascending order
            } else {
                windowExceeded = true;
                break;
            }
        }
        
        return new MemoryContextResult(contextMessages, usedTokens, windowExceeded);
    }

    private static class MemoryContextResult {
        public final List<Message> messages;
        public final long usedTokens;
        public final boolean windowExceeded;

        public MemoryContextResult(List<Message> messages, long usedTokens, boolean windowExceeded) {
            this.messages = messages;
            this.usedTokens = usedTokens;
            this.windowExceeded = windowExceeded;
        }
    }
}