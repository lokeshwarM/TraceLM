package com.tracelm.backend.service;

import com.tracelm.backend.entity.Conversation;
import com.tracelm.backend.entity.Message;
import com.tracelm.backend.provider.LLMProvider;
import com.tracelm.backend.provider.GeminiProvider;
import com.tracelm.backend.repository.ConversationRepository;
import com.tracelm.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final GeminiProvider llmProvider;

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

        String aiResponse = llmProvider.generateResponse(prompt);

        Message assistantMessage = Message.builder()
                .conversation(conversation)
                .role("ASSISTANT")
                .content(aiResponse)
                .build();

        messageRepository.save(assistantMessage);

        return aiResponse;
    }
}