package com.tracelm.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompareResponseChunk {
    private String model;
    private String content;
    private Long latency;
    private Integer inputTokens;
    private Integer outputTokens;
    private String status;
    private String errorMessage;
}
