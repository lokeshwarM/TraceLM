package com.tracelm.backend.automation.workflow;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkflowExecutor {

    private final WorkflowRegistry workflowRegistry;

    public WorkflowResult executeWorkflow(String workflowName, AutomationWorkflowContext context) {
        AutomationWorkflow workflow = workflowRegistry.getWorkflow(workflowName).orElse(null);

        if (workflow == null) {
            return WorkflowResult.builder()
                    .status(WorkflowStatus.FAILURE)
                    .message("Workflow not found in registry: " + workflowName)
                    .build();
        }

        try {
            return workflow.execute(context);
        } catch (Exception e) {
            return WorkflowResult.builder()
                    .status(WorkflowStatus.FAILURE)
                    .message("Workflow execution failed: " + e.getMessage())
                    .build();
        }
    }
}
