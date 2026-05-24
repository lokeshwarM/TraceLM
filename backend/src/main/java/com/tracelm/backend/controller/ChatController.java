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
    public Map<String, Object> chat(@RequestBody Map<String, String> request) {

        String prompt = request.get("prompt");
        String conversationIdStr = request.get("conversationId");
        UUID conversationId = (conversationIdStr != null && !conversationIdStr.trim().isEmpty()) ? UUID.fromString(conversationIdStr) : null;

        Map<String, String> response = conversationService.processMessage(prompt, conversationId);

        return Map.of(
                "response", response.get("response"),
                "conversationId", response.get("conversationId")
        );
    }

    @PostMapping(value = "/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chatStream(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String conversationIdStr = request.get("conversationId");
        UUID conversationId = (conversationIdStr != null && !conversationIdStr.trim().isEmpty()) ? UUID.fromString(conversationIdStr) : null;
        return conversationService.processMessageStream(prompt, conversationId)
                .map(chunk -> ServerSentEvent.<String>builder(chunk).build());
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