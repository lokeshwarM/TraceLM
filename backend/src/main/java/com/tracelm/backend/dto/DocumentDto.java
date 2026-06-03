package com.tracelm.backend.dto;

import com.tracelm.backend.entity.DocumentStatus;
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
public class DocumentDto {
    private UUID id;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private Integer pageCount;
    private Integer chunkCount;
    private String extractedText;
    private DocumentStatus documentStatus;
    private LocalDateTime uploadedAt;
}
