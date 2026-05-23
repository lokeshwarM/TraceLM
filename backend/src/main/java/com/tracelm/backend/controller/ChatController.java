package com.tracelm.backend.controller;

import com.tracelm.backend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin
public class ChatController {

    private final ConversationService conversationService;

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> request) {

        String prompt = request.get("prompt");

        String response = conversationService.processMessage(prompt);

        return Map.of(
                "response", response
        );
    }
}