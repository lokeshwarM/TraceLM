package com.tracelm.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "chunk_count")
    @Builder.Default
    private Integer chunkCount = 0;

    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_status", nullable = false)
    private DocumentStatus documentStatus;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DocumentChunk> chunks = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
        if (chunkCount == null) {
            chunkCount = 0;
        }
    }
}
