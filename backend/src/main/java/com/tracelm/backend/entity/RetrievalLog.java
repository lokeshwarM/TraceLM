package com.tracelm.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "retrieval_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetrievalLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "conversation_id")
    private UUID conversationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "query", columnDefinition = "TEXT", nullable = false)
    private String query;

    @Column(name = "retrieved_chunk_ids", columnDefinition = "TEXT")
    private String retrievedChunkIds;

    @Column(name = "similarity_scores", columnDefinition = "TEXT")
    private String similarityScores;

    @Column(name = "document_ids", columnDefinition = "TEXT")
    private String documentIds;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
