package com.tracelm.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(nullable = false)
    private String role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "pii_redacted", nullable = false)
    @Builder.Default
    private boolean piiRedacted = false;

    @Column(name = "sources_json", columnDefinition = "TEXT")
    private String sourcesJson;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}