package com.tracelm.backend.repository;

import com.tracelm.backend.entity.RetrievalLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RetrievalLogRepository extends JpaRepository<RetrievalLog, UUID> {
}
