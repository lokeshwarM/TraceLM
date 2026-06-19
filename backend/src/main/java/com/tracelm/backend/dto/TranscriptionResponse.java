package com.tracelm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TranscriptionResponse {
    private String text;
    private long latencyMs;
    private int audioSizeBytes;
    private String status;
}
