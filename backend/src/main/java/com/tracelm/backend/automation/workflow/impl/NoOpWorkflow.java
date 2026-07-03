package com.tracelm.backend.automation.workflow.impl;

import com.tracelm.backend.automation.workflow.AutomationWorkflow;
import com.tracelm.backend.automation.workflow.AutomationWorkflowContext;
import com.tracelm.backend.automation.workflow.WorkflowResult;
import com.tracelm.backend.automation.workflow.WorkflowStatus;
import org.springframework.stereotype.Component;

@Component
public class NoOpWorkflow implements AutomationWorkflow {

    @Override
    public String getName() {
        return "NoOpWorkflow";
    }

    @Override
    public WorkflowResult execute(AutomationWorkflowContext context) {
        return WorkflowResult.builder()
                .status(WorkflowStatus.SUCCESS)
                .message("NoOp completed successfully")
                .build();
    }
}
