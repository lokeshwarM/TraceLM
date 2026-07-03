package com.tracelm.backend.automation.career.repository;

import com.tracelm.backend.automation.career.entity.CareerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CareerProfileRepository extends JpaRepository<CareerProfile, UUID> {
}
