package com.tracelm.backend.controller;

import com.tracelm.backend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.Map;
import java.util.List;
import java.util.UUID;
import com.tracelm.backend.dto.ConversationResponse;
import com.tracelm.backend.dto.ConversationMetricsResponse;
import reactor.core.publisher.Flux;
import org.springframework.http.codec.ServerSentEvent;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ConversationService conversationService;

    @PostMapping
    public Object chat(@RequestBody Map<String, Object> request, Principal principal) {

        String prompt = (String) request.get("prompt");
        String conversationIdStr = (String) request.get("conversationId");
        UUID conversationId = (conversationIdStr != null && !conversationIdStr.trim().isEmpty()) ? UUID.fromString(conversationIdStr) : null;

        if (request.containsKey("models")) {
            List<String> models = (List<String>) request.get("models");
            if (models != null && !models.isEmpty()) {
                return conversationService.processMessages(prompt, conversationId, models, principal.getName());
            }
        }

        String model = (String) request.get("model");
        Map<String, String> response = conversationService.processMessage(prompt, conversationId, model, principal.getName());

        return Map.of(
                "response", response.get("response"),
                "conversationId", response.get("conversationId"),
                "model", response.getOrDefault("model", model),
                "sources", response.containsKey("sources") ? response.get("sources") : List.of()
        );
    }

        @PostMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter chatStream(@RequestBody Map<String, Object> request, Principal principal) {
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(0L);
        
        String prompt = (String) request.get("prompt");
        String conversationIdStr = (String) request.get("conversationId");
        UUID conversationId = (conversationIdStr != null && !conversationIdStr.trim().isEmpty()) ? UUID.fromString(conversationIdStr) : null;
        String requestId = (String) request.get("requestId");
        
        if (request.containsKey("models")) {
            List<String> models = (List<String>) request.get("models");
            if (models != null && !models.isEmpty()) {
                conversationService.processCompareStream(prompt, conversationId, models, requestId, principal.getName())
                        .subscribe(
                                chunk -> {
                                    try {
                                        emitter.send(chunk);
                                    } catch (Exception e) {
                                        System.err.println("Error sending SSE chunk: " + e.getMessage());
                                        e.printStackTrace();
                                        emitter.completeWithError(e);
                                    }
                                },
                                error -> {
                                    System.err.println("Stream error: " + error.getMessage());
                                    error.printStackTrace();
                                    emitter.completeWithError(error);
                                },
                                () -> {
                                    try {
                                        emitter.send(java.util.Map.of("status", "DONE"));
                                        emitter.complete();
                                    } catch (Exception e) {
                                        System.err.println("Error completing stream: " + e.getMessage());
                                        emitter.completeWithError(e);
                                    }
                                }
                        );
                return emitter;
            }
        }
        
        String model = (String) request.get("model");
        conversationService.processMessageStream(prompt, conversationId, model, requestId, principal.getName())
                .subscribe(
                        chunk -> {
                            try {
                                emitter.send(chunk);
                            } catch (Exception e) {
                                System.err.println("Error sending SSE chunk: " + e.getMessage());
                                e.printStackTrace();
                                emitter.completeWithError(e);
                            }
                        },
                        error -> {
                            System.err.println("Stream error: " + error.getMessage());
                            error.printStackTrace();
                            emitter.completeWithError(error);
                        },
                        () -> {
                            try {
                                emitter.send(java.util.Map.of("status", "DONE"));
                                emitter.complete();
                            } catch (Exception e) {
                                System.err.println("Error completing stream: " + e.getMessage());
                                emitter.completeWithError(e);
                            }
                        }
                );
        return emitter;
    }

    @PostMapping("/cancel/{requestId}")
    public void cancelRequest(@PathVariable String requestId) {
        conversationService.cancelRequest(requestId);
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> getAllConversations(Principal principal) {
        return conversationService.getAllConversations(principal.getName());
    }

    @GetMapping("/conversations/{id}")
    public ConversationResponse getConversation(@PathVariable UUID id, Principal principal) {
        return conversationService.getConversation(id, principal.getName());
    }

    @GetMapping("/conversations/{id}/metrics")
    public ConversationMetricsResponse getConversationMetrics(@PathVariable UUID id, Principal principal) {
        return conversationService.getConversationMetrics(id, principal.getName());
    }

    @GetMapping("/conversations/{id}/logs")
    public List<com.tracelm.backend.dto.InferenceLogResponse> getConversationLogs(@PathVariable UUID id, Principal principal) {
        return conversationService.getConversationLogs(id, principal.getName());
    }
}