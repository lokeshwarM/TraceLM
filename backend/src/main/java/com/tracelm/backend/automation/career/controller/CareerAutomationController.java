package com.tracelm.backend.automation.career.controller;

import com.tracelm.backend.automation.career.service.CareerAutomationService;
import com.tracelm.backend.automation.job.dto.JobListing;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/automation/career")
@RequiredArgsConstructor
public class CareerAutomationController {

    private final CareerAutomationService careerAutomationService;

    @PostMapping("/feed/refresh")
    public ResponseEntity<?> refreshFeed() {
        try {
            List<JobListing> jobs = careerAutomationService.refreshFeed();
            return ResponseEntity.ok(jobs);
        } catch (IllegalStateException e) {
            if ("Career profile not configured.".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An error occurred while refreshing the feed."));
        }
    }
}
