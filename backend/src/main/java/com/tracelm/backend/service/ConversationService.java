package com.tracelm.backend.service;

import com.tracelm.backend.entity.Conversation;
import com.tracelm.backend.entity.Message;
import com.tracelm.backend.provider.LLMProvider;
import com.tracelm.backend.provider.GeminiProvider;
import com.tracelm.backend.repository.ConversationRepository;
import com.tracelm.backend.repository.MessageRepository;
import com.tracelm.backend.logging.LoggingService;
import com.tracelm.backend.dto.LLMResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final GeminiProvider llmProvider;
    private final LoggingService loggingService;

    public String processMessage(String prompt) {

        Conversation conversation = Conversation.builder()
                .title(prompt.substring(0, Math.min(prompt.length(), 30)))
                .status("ACTIVE")
                .build();

        conversationRepository.save(conversation);

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

        return response.getContent();
    }
}