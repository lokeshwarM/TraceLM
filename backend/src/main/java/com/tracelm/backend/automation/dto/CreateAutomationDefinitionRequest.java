package com.tracelm.backend.automation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAutomationDefinitionRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Type is required")
    private String type;
    
    @Builder.Default
    private boolean enabled = true;
}
