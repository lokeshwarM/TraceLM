package com.tracelm.backend.repository;

import com.tracelm.backend.entity.InferenceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InferenceLogRepository extends JpaRepository<InferenceLog, UUID> {
}