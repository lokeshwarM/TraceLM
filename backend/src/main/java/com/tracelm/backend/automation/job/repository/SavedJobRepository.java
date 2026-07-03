package com.tracelm.backend.automation.job.repository;

import com.tracelm.backend.automation.job.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    
    // We assume userId can be null for now based on requirements
    Optional<SavedJob> findByUserIdAndJobId(UUID userId, UUID jobId);
    
    List<SavedJob> findByUserIdOrderBySavedAtDesc(UUID userId);
    
    void deleteByUserIdAndJobId(UUID userId, UUID jobId);
}
