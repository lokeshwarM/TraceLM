package com.tracelm.backend.automation.job.repository;

import com.tracelm.backend.automation.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    Optional<Job> findByExternalJobIdAndProvider(String externalJobId, String provider);
}
