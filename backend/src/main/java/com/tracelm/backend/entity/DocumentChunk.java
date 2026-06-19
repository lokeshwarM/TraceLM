package com.tracelm.backend.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_chunks", indexes = {
    @Index(name = "idx_chunk_document_id", columnList = "document_id")
    // Note: HNSW or IVFFlat index for vector search would usually be created natively via SQL.
    // e.g., CREATE INDEX ON document_chunks USING hnsw (embedding vector_l2_ops);
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentChunk {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "page_number")
    private Integer pageNumber;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(name = "embedding", columnDefinition = "vector(768)")
    private float[] embedding;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
