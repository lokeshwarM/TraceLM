package com.tracelm.backend.automation.repository;

import com.tracelm.backend.automation.entity.AutomationDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AutomationDefinitionRepository extends JpaRepository<AutomationDefinition, UUID> {
}
