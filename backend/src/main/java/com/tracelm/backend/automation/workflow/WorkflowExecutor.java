package com.tracelm.backend.automation.workflow;

import com.tracelm.backend.automation.entity.AutomationExecution;
import com.tracelm.backend.automation.service.AutomationExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkflowExecutor {

    private final WorkflowRegistry workflowRegistry;
    private final AutomationExecutionService executionService;

    public WorkflowResult executeWorkflow(String workflowName, AutomationWorkflowContext context) {
        AutomationExecution execution = executionService.startExecution(workflowName);
        
        AutomationWorkflow workflow = workflowRegistry.getWorkflow(workflowName).orElse(null);

        if (workflow == null) {
            executionService.completeExecution(execution.getId(), WorkflowStatus.FAILURE.name());
            return WorkflowResult.builder()
                    .status(WorkflowStatus.FAILURE)
                    .message("Workflow not found in registry: " + workflowName)
                    .build();
        }

        try {
            WorkflowResult result = workflow.execute(context);
            executionService.completeExecution(execution.getId(), result.getStatus().name());
            return result;
        } catch (Exception e) {
            executionService.completeExecution(execution.getId(), WorkflowStatus.FAILURE.name());
            return WorkflowResult.builder()
                    .status(WorkflowStatus.FAILURE)
                    .message("Workflow execution failed: " + e.getMessage())
                    .build();
        }
    }
}
