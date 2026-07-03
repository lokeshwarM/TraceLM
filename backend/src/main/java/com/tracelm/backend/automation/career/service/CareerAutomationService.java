package com.tracelm.backend.automation.career.service;

import com.tracelm.backend.automation.career.entity.CareerProfile;
import com.tracelm.backend.automation.career.repository.CareerProfileRepository;
import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.JobSearchRequest;
import com.tracelm.backend.automation.job.service.JobSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CareerAutomationService {

    private final CareerProfileRepository careerProfileRepository;
    private final JobSearchService jobSearchService;

    public List<JobListing> refreshFeed() {
        List<CareerProfile> profiles = careerProfileRepository.findAll();
        if (profiles.isEmpty()) {
            throw new IllegalStateException("Career profile not configured.");
        }

        CareerProfile profile = profiles.get(0);

        JobSearchRequest request = new JobSearchRequest();
        
        if (profile.getPreferredRoles() != null && !profile.getPreferredRoles().isEmpty()) {
            request.setKeyword(String.join(" ", profile.getPreferredRoles()));
        }

        if (profile.getPreferredLocations() != null && !profile.getPreferredLocations().isEmpty()) {
            request.setLocation(String.join(" ", profile.getPreferredLocations()));
        }

        if (profile.getYearsOfExperience() != null) {
            request.setExperience(String.valueOf(profile.getYearsOfExperience()));
        }

        if (profile.getRemoteOnly() != null) {
            request.setRemoteOnly(profile.getRemoteOnly());
        }

        log.info("Executing automated job search for profile");
        
        return jobSearchService.searchJobs(request);
    }
}
