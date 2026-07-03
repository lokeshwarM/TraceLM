package com.tracelm.backend.automation.workflow;

public interface AutomationWorkflow {
    String getName();
    WorkflowResult execute(AutomationWorkflowContext context);
}
