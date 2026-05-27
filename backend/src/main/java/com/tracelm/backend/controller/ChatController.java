package com.tracelm.backend.controller;

import com.tracelm.backend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
@CrossOrigin
public class ChatController {

    private final ConversationService conversationService;

    @PostMapping
    public Object chat(@RequestBody Map<String, Object> request) {

        String prompt = (String) request.get("prompt");
        String conversationIdStr = (String) request.get("conversationId");
        UUID conversationId = (conversationIdStr != null && !conversationIdStr.trim().isEmpty()) ? UUID.fromString(conversationIdStr) : null;

        if (request.containsKey("models")) {
            List<String> models = (List<String>) request.get("models");
            if (models != null && !models.isEmpty()) {
                return conversationService.processMessages(prompt, conversationId, models);
            }
        }

        String model = (String) request.get("model");
        Map<String, String> response = conversationService.processMessage(prompt, conversationId, model);

        return Map.of(
                "response", response.get("response"),
                "conversationId", response.get("conversationId"),
                "model", response.getOrDefault("model", model)
        );
    }

    @PostMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Object>> chatStream(@RequestBody Map<String, Object> request) {
        String prompt = (String) request.get("prompt");
        String conversationIdStr = (String) request.get("conversationId");
        UUID conversationId = (conversationIdStr != null && !conversationIdStr.trim().isEmpty()) ? UUID.fromString(conversationIdStr) : null;
        String requestId = (String) request.get("requestId");
        
        if (request.containsKey("models")) {
            List<String> models = (List<String>) request.get("models");
            if (models != null && !models.isEmpty()) {
                return conversationService.processCompareStream(prompt, conversationId, models, requestId)
                        .map(chunk -> ServerSentEvent.<Object>builder(chunk).build());
            }
        }
        
        String model = (String) request.get("model");
        return conversationService.processMessageStream(prompt, conversationId, model, requestId)
                .map(chunk -> ServerSentEvent.<Object>builder(chunk).build());
    }

    @PostMapping("/cancel/{requestId}")
    public void cancelRequest(@PathVariable String requestId) {
        conversationService.cancelRequest(requestId);
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> getAllConversations() {
        return conversationService.getAllConversations();
    }

    @GetMapping("/conversations/{id}")
    public ConversationResponse getConversation(@PathVariable UUID id) {
        return conversationService.getConversation(id);
    }

    @GetMapping("/conversations/{id}/metrics")
    public ConversationMetricsResponse getConversationMetrics(@PathVariable UUID id) {
        return conversationService.getConversationMetrics(id);
    }

    @GetMapping("/conversations/{id}/logs")
    public List<com.tracelm.backend.dto.InferenceLogResponse> getConversationLogs(@PathVariable UUID id) {
        return conversationService.getConversationLogs(id);
    }
}