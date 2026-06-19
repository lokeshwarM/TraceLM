package com.tracelm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LLMResponse {

    private String content;

    private Integer inputTokens;

    private Integer outputTokens;

    private String provider;

    private String model;

    private String conversationId;

    private Object sources;

    private String audioData;
}