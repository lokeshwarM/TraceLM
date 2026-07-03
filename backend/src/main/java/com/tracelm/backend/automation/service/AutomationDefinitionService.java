package com.tracelm.backend.automation.service;

import com.tracelm.backend.automation.dto.AutomationDefinitionDto;
import com.tracelm.backend.automation.dto.CreateAutomationDefinitionRequest;
import com.tracelm.backend.automation.dto.UpdateAutomationDefinitionRequest;
import com.tracelm.backend.automation.entity.AutomationDefinition;
import com.tracelm.backend.automation.repository.AutomationDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AutomationDefinitionService {

    private final AutomationDefinitionRepository repository;

    @Transactional(readOnly = true)
    public List<AutomationDefinitionDto> getAllDefinitions() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AutomationDefinitionDto getDefinitionById(UUID id) {
        return repository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("AutomationDefinition not found with id: " + id));
    }

    @Transactional
    public AutomationDefinitionDto createDefinition(CreateAutomationDefinitionRequest request) {
        AutomationDefinition definition = AutomationDefinition.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .enabled(request.isEnabled())
                .build();

        AutomationDefinition saved = repository.save(definition);
        return mapToDto(saved);
    }

    @Transactional
    public AutomationDefinitionDto updateDefinition(UUID id, UpdateAutomationDefinitionRequest request) {
        AutomationDefinition definition = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("AutomationDefinition not found with id: " + id));

        if (request.getName() != null) {
            definition.setName(request.getName());
        }
        if (request.getDescription() != null) {
            definition.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            definition.setType(request.getType());
        }
        if (request.getEnabled() != null) {
            definition.setEnabled(request.getEnabled());
        }

        AutomationDefinition updated = repository.save(definition);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteDefinition(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("AutomationDefinition not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private AutomationDefinitionDto mapToDto(AutomationDefinition entity) {
        return AutomationDefinitionDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .enabled(entity.isEnabled())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
