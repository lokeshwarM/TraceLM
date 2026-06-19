package com.tracelm.backend.repository;

import com.tracelm.backend.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, UUID> {

    @Query(value = "SELECT c.* FROM document_chunks c " +
                   "JOIN documents d ON c.document_id = d.id " +
                   "WHERE d.user_id = cast(:userId as uuid) " +
                   "ORDER BY c.embedding <=> cast(:embedding as vector) " +
                   "LIMIT :limit", 
           nativeQuery = true)
    List<DocumentChunk> findTopRelevantChunks(@Param("userId") UUID userId, 
                                              @Param("embedding") String embedding, 
                                              @Param("limit") int limit);
}
