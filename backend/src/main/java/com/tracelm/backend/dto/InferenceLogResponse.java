package com.tracelm.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InferenceLogResponse {
    private String provider;
    private String model;
    private Long latencyMs;
    private Integer inputTokens;
    private Integer outputTokens;
    private String status;
    private LocalDateTime createdAt;
}
