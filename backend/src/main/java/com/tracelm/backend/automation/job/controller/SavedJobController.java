package com.tracelm.backend.automation.job.controller;

import com.tracelm.backend.automation.job.dto.SavedJobDto;
import com.tracelm.backend.automation.job.service.SavedJobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/automation/jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobService savedJobService;

    @PostMapping("/{jobId}/save")
    public ResponseEntity<SavedJobDto> saveJob(@PathVariable UUID jobId, Principal principal) {
        try {
            UUID userId = UUID.fromString(principal.getName());
            SavedJobDto savedJob = savedJobService.saveJob(jobId, userId);
            return ResponseEntity.ok(savedJob);
        } catch (RuntimeException e) {
            if ("Job not found".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            log.error("Error saving job {}: {}", jobId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{jobId}/save")
    public ResponseEntity<Void> unsaveJob(@PathVariable UUID jobId, Principal principal) {
        try {
            UUID userId = UUID.fromString(principal.getName());
            savedJobService.unsaveJob(jobId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if ("Job not found".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            log.error("Error unsaving job {}: {}", jobId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/saved")
    public ResponseEntity<List<SavedJobDto>> getSavedJobs(Principal principal) {
        try {
            UUID userId = UUID.fromString(principal.getName());
            List<SavedJobDto> savedJobs = savedJobService.getSavedJobs(userId);
            return ResponseEntity.ok(savedJobs);
        } catch (Exception e) {
            log.error("Error fetching saved jobs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
