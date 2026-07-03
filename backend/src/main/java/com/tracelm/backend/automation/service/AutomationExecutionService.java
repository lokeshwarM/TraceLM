package com.tracelm.backend.automation.service;

import com.tracelm.backend.automation.entity.AutomationExecution;
import com.tracelm.backend.automation.repository.AutomationExecutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AutomationExecutionService {
    private final AutomationExecutionRepository repository;
    
    @Transactional
    public AutomationExecution startExecution(String workflowName) {
        AutomationExecution execution = AutomationExecution.builder()
                .workflowName(workflowName)
                .status("RUNNING")
                .startedAt(LocalDateTime.now())
                .build();
        return repository.save(execution);
    }

    @Transactional
    public void completeExecution(UUID executionId, String status) {
        repository.findById(executionId).ifPresent(execution -> {
            execution.setStatus(status);
            execution.setFinishedAt(LocalDateTime.now());
            repository.save(execution);
        });
    }
}
