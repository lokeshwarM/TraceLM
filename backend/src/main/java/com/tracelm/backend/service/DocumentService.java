package com.tracelm.backend.service;

import com.tracelm.backend.dto.DocumentDto;
import com.tracelm.backend.entity.Document;
import com.tracelm.backend.entity.DocumentStatus;
import com.tracelm.backend.entity.User;
import com.tracelm.backend.repository.DocumentRepository;
import com.tracelm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.tracelm.backend.provider.EmbeddingProvider;
import com.tracelm.backend.repository.DocumentChunkRepository;
import com.tracelm.backend.entity.DocumentChunk;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentExtractionService extractionService;
    private final DocumentChunker documentChunker;
    private final EmbeddingProvider embeddingProvider;
    private final DocumentChunkRepository documentChunkRepository;

    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

    public DocumentDto uploadDocument(MultipartFile file, String principalUserId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 25MB");
        }
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files are supported");
        }

        UUID userId = UUID.fromString(principalUserId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Set initial status to PROCESSING
        Document document = Document.builder()
                .user(user)
                .fileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "Untitled.pdf")
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .documentStatus(DocumentStatus.PROCESSING)
                .build();
        
        document = documentRepository.save(document);

        try {
            var result = extractionService.extractText(file);
            document.setExtractedText(result.text());
            document.setPageCount(result.pageCount());
            
            document = documentRepository.save(document);

            List<DocumentChunker.ChunkResult> chunks = documentChunker.chunkDocument(result.pages());
            for (DocumentChunker.ChunkResult chunk : chunks) {
                float[] embedding = embeddingProvider.generateEmbedding(chunk.content());
                DocumentChunk docChunk = DocumentChunk.builder()
                        .document(document)
                        .chunkIndex(chunk.chunkIndex())
                        .pageNumber(chunk.pageNumber())
                        .content(chunk.content())
                        .embedding(embedding)
                        .build();
                documentChunkRepository.save(docChunk);
            }

            document.setChunkCount(chunks.size());
            document.setDocumentStatus(DocumentStatus.READY);
        } catch (Exception e) {
            document.setDocumentStatus(DocumentStatus.FAILED);
            documentRepository.save(document);
            throw new RuntimeException("Failed to process document: " + e.getMessage(), e);
        }

        document = documentRepository.save(document);
        return mapToDto(document);
    }

    public List<DocumentDto> getAllDocuments(String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        return documentRepository.findByUserIdOrderByUploadedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DocumentDto getDocument(UUID id, String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        Document document = documentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Document not found or unauthorized"));
        return mapToDto(document);
    }

    public void deleteDocument(UUID id, String principalUserId) {
        UUID userId = UUID.fromString(principalUserId);
        Document document = documentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Document not found or unauthorized"));
        documentRepository.delete(document);
    }

    private DocumentDto mapToDto(Document document) {
        return DocumentDto.builder()
                .id(document.getId())
                .fileName(document.getFileName())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .pageCount(document.getPageCount())
                .chunkCount(document.getChunkCount())
                .extractedText(document.getExtractedText())
                .documentStatus(document.getDocumentStatus())
                .uploadedAt(document.getUploadedAt())
                .build();
    }
}
