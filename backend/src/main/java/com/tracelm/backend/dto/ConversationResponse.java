package com.tracelm.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ConversationResponse {

    private UUID id;

    private String title;

    private String status;

    private LocalDateTime createdAt;

    private List<MessageResponse> messages;
}