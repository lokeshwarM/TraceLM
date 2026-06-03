package com.tracelm.backend.service;

import com.tracelm.backend.dto.MemoryDto;
import com.tracelm.backend.dto.MemoryRequest;
import com.tracelm.backend.entity.Conversation;
import com.tracelm.backend.entity.Memory;
import com.tracelm.backend.entity.Message;
import com.tracelm.backend.entity.User;
import com.tracelm.backend.repository.ConversationRepository;
import com.tracelm.backend.repository.InferenceLogRepository;
import com.tracelm.backend.repository.MemoryRepository;
import com.tracelm.backend.repository.MessageRepository;
import com.tracelm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final MemoryRepository memoryRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final InferenceLogRepository inferenceLogRepository;
    private final UserRepository userRepository;
    private final MemorySummaryService memorySummaryService;

    public MemoryDto createMemory(MemoryRequest request, String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot save memory from another user's conversation");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        String summary = memorySummaryService.generateSummary(messages);
        
        LocalDateTime lastMessageAt = conversation.getCreatedAt();
        if (!messages.isEmpty()) {
            lastMessageAt = messages.get(messages.size() - 1).getCreatedAt();
        }
        
        var metrics = inferenceLogRepository.getConversationMetrics(conversation.getId());
        long inputTokens = metrics.getTotalInputTokens() != null ? metrics.getTotalInputTokens() : 0L;
        long outputTokens = metrics.getTotalOutputTokens() != null ? metrics.getTotalOutputTokens() : 0L;
        long totalTokens = inputTokens + outputTokens;

        Memory memory = Memory.builder()
                .user(user)
                .title(conversation.getTitle())
                .summary(summary)
                .sourceConversationId(conversation.getId())
                .messageCount(messages.size())
                .tokenCount(totalTokens)
                .lastMessageAt(lastMessageAt)
                .pinned(false)
                .build();

        memory = memoryRepository.save(memory);
        return mapToDto(memory);
    }

    public List<MemoryDto> getAllMemories(String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        return memoryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MemoryDto getMemory(UUID id, String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        Memory memory = memoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Memory not found or unauthorized"));
        return mapToDto(memory);
    }

    public void deleteMemory(UUID id, String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        Memory memory = memoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Memory not found or unauthorized"));
        memoryRepository.delete(memory);
    }

    private MemoryDto mapToDto(Memory memory) {
        return MemoryDto.builder()
                .id(memory.getId())
                .title(memory.getTitle())
                .summary(memory.getSummary())
                .sourceConversationId(memory.getSourceConversationId())
                .messageCount(memory.getMessageCount())
                .tokenCount(memory.getTokenCount())
                .lastMessageAt(memory.getLastMessageAt())
                .pinned(memory.getPinned())
                .createdAt(memory.getCreatedAt())
                .build();
    }
}
