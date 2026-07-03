package com.tracelm.backend.automation.job.controller;

import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.JobSearchRequest;
import com.tracelm.backend.automation.job.service.JobSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/automation/jobs")
@RequiredArgsConstructor
public class JobSearchController {

    private final JobSearchService jobSearchService;

    @PostMapping("/search")
    public ResponseEntity<List<JobListing>> searchJobs(@Valid @RequestBody JobSearchRequest request) {
        try {
            List<JobListing> listings = jobSearchService.searchJobs(request);
            return ResponseEntity.ok(listings);
        } catch (Exception e) {
            log.error("Unexpected error during job search: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
