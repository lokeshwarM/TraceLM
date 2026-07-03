package com.tracelm.backend.automation.controller;

import com.tracelm.backend.automation.workflow.AutomationWorkflowContext;
import com.tracelm.backend.automation.workflow.WorkflowExecutor;
import com.tracelm.backend.automation.workflow.WorkflowResult;
import com.tracelm.backend.automation.workflow.WorkflowStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/automation/workflows")
@RequiredArgsConstructor
public class AutomationExecutionController {

    private final WorkflowExecutor workflowExecutor;

    @PostMapping("/{workflowName}/execute")
    public ResponseEntity<WorkflowResult> executeWorkflow(@PathVariable String workflowName) {
        AutomationWorkflowContext context = new AutomationWorkflowContext();
        
        WorkflowResult result = workflowExecutor.executeWorkflow(workflowName, context);
        
        if (result.getStatus() == WorkflowStatus.FAILURE) {
            if (result.getMessage() != null && result.getMessage().contains("Workflow not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
        
        return ResponseEntity.ok(result);
    }
}
