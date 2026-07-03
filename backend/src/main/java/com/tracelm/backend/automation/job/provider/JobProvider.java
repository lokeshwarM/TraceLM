package com.tracelm.backend.automation.job.provider;

import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.JobSearchRequest;

import java.util.List;

public interface JobProvider {
    String getProviderName();
    List<JobListing> searchJobs(JobSearchRequest request);
}
