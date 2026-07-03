package com.tracelm.backend.automation.service;

import com.tracelm.backend.automation.repository.AutomationExecutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutomationExecutionService {
    private final AutomationExecutionRepository repository;
    
    // Skeleton for execution tracking
}
