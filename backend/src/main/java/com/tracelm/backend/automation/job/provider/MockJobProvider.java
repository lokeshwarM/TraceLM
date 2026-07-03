package com.tracelm.backend.automation.job.provider;

import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.JobSearchRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class MockJobProvider implements JobProvider {

    @Override
    public String getProviderName() {
        return "MockJobProvider";
    }

    @Override
    public List<JobListing> searchJobs(JobSearchRequest request) {
        List<JobListing> mockJobs = new ArrayList<>();
        
        for (int i = 1; i <= 5; i++) {
            mockJobs.add(JobListing.builder()
                    .jobId(UUID.randomUUID().toString())
                    .title("Software Engineer " + i + (request.getKeyword() != null ? " - " + request.getKeyword() : ""))
                    .company("Mock Company " + i)
                    .location(request.getLocation() != null ? request.getLocation() : "Remote")
                    .employmentType("Full-time")
                    .experienceLevel(request.getExperience() != null ? request.getExperience() : "Mid-Level")
                    .salary("$100,000 - $150,000")
                    .jobUrl("https://mockprovider.com/jobs/" + i)
                    .provider(getProviderName())
                    .description("This is a mock job description for testing purposes.")
                    .postedDate(LocalDateTime.now().minusDays(i))
                    .build());
        }
        
        return mockJobs;
    }
}
