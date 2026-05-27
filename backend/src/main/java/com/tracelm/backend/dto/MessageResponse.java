package com.tracelm.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MessageResponse {

    private UUID id;

    private String role;

    private String content;

    private LocalDateTime createdAt;

    private boolean piiRedacted;
}