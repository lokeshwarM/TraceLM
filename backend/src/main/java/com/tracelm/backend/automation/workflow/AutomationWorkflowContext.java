package com.tracelm.backend.automation.workflow;

import lombok.Data;

import java.util.Map;
import java.util.HashMap;

@Data
public class AutomationWorkflowContext {
    private String workflowId;
    private Map<String, Object> variables = new HashMap<>();
}
