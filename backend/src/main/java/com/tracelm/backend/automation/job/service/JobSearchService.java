package com.tracelm.backend.automation.job.service;

import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.JobSearchRequest;
import com.tracelm.backend.automation.job.provider.JobProvider;
import com.tracelm.backend.automation.job.provider.JobProviderRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobSearchService {

    private final JobProviderRegistry providerRegistry;
    private final JobPersistenceService jobPersistenceService;

    public List<JobListing> searchJobs(JobSearchRequest request) {
        List<JobProvider> providers = providerRegistry.getAllProviders();
        Map<String, JobListing> uniqueJobs = new HashMap<>();

        for (JobProvider provider : providers) {
            try {
                List<JobListing> listings = provider.searchJobs(request);
                if (listings != null) {
                    for (JobListing job : listings) {
                        String uniqueKey = job.getJobId() + "-" + job.getProvider();
                        uniqueJobs.putIfAbsent(uniqueKey, job);
                    }
                }
            } catch (Exception e) {
                log.error("Provider {} failed to execute search: {}", provider.getProviderName(), e.getMessage(), e);
            }
        }

        List<JobListing> finalResults = uniqueJobs.values().stream()
                .sorted((j1, j2) -> {
                    if (j1.getPostedDate() == null && j2.getPostedDate() == null) return 0;
                    if (j1.getPostedDate() == null) return 1;
                    if (j2.getPostedDate() == null) return -1;
                    return j2.getPostedDate().compareTo(j1.getPostedDate());
                })
                .collect(Collectors.toList());

        for (JobListing job : finalResults) {
            try {
                jobPersistenceService.saveOrUpdateJob(job);
            } catch (Exception e) {
                log.error("Failed to persist job {} from {}: {}", job.getJobId(), job.getProvider(), e.getMessage());
            }
        }

        return finalResults;
    }
}
