package com.tracelm.backend.automation.workflow;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class WorkflowRegistry {

    private final Map<String, AutomationWorkflow> workflowMap;

    public WorkflowRegistry(List<AutomationWorkflow> workflows) {
        this.workflowMap = workflows.stream()
                .collect(Collectors.toMap(AutomationWorkflow::getName, Function.identity()));
    }

    public Optional<AutomationWorkflow> getWorkflow(String name) {
        return Optional.ofNullable(workflowMap.get(name));
    }
}
