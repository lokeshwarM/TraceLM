package com.tracelm.backend.automation.controller;

import com.tracelm.backend.automation.dto.AutomationDefinitionDto;
import com.tracelm.backend.automation.dto.CreateAutomationDefinitionRequest;
import com.tracelm.backend.automation.dto.UpdateAutomationDefinitionRequest;
import com.tracelm.backend.automation.service.AutomationDefinitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/automation/definitions")
@RequiredArgsConstructor
public class AutomationDefinitionController {

    private final AutomationDefinitionService service;

    @GetMapping
    public ResponseEntity<List<AutomationDefinitionDto>> getAllDefinitions() {
        return ResponseEntity.ok(service.getAllDefinitions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutomationDefinitionDto> getDefinitionById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getDefinitionById(id));
    }

    @PostMapping
    public ResponseEntity<AutomationDefinitionDto> createDefinition(@Valid @RequestBody CreateAutomationDefinitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createDefinition(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutomationDefinitionDto> updateDefinition(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAutomationDefinitionRequest request) {
        return ResponseEntity.ok(service.updateDefinition(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDefinition(@PathVariable UUID id) {
        service.deleteDefinition(id);
        return ResponseEntity.noContent().build();
    }
}
