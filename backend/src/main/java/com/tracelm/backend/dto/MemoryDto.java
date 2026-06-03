package com.tracelm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryDto {
    private UUID id;
    private String title;
    private String summary;
    private UUID sourceConversationId;
    private Integer messageCount;
    private Long tokenCount;
    private LocalDateTime lastMessageAt;
    private Boolean pinned;
    private LocalDateTime createdAt;
}
