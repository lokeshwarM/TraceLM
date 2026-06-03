package com.tracelm.backend.repository;

import com.tracelm.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByUserIdOrderByUploadedAtDesc(UUID userId);
    Optional<Document> findByIdAndUserId(UUID id, UUID userId);
}
