package com.tracelm.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "memories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Memory {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary;

    @Column(name = "source_conversation_id", nullable = false)
    private UUID sourceConversationId;

    @Column(name = "message_count", nullable = false)
    private Integer messageCount;

    @Column(name = "token_count", nullable = false)
    private Long tokenCount;

    @Column(name = "last_message_at", nullable = false)
    private LocalDateTime lastMessageAt;

    @Column(nullable = false)
    private Boolean pinned;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (pinned == null) {
            pinned = false;
        }
    }
}
