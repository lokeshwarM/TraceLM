package com.tracelm.backend.repository;

import com.tracelm.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    List<Conversation> findAllByOrderByUpdatedAtDesc();
    List<Conversation> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}