package com.tracelm.backend.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAutomationDefinitionRequest {
    private String name;
    private String description;
    private String type;
    private Boolean enabled;
}
