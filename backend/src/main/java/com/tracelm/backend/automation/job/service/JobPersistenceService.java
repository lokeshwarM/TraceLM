package com.tracelm.backend.automation.job.service;

import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.entity.Job;
import com.tracelm.backend.automation.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobPersistenceService {

    private final JobRepository jobRepository;

    @Transactional
    public void saveOrUpdateJob(JobListing listing) {
        Optional<Job> existingJobOpt = jobRepository.findByExternalJobIdAndProvider(
                listing.getJobId(), listing.getProvider());

        Job job;
        if (existingJobOpt.isPresent()) {
            job = existingJobOpt.get();
        } else {
            job = new Job();
            job.setExternalJobId(listing.getJobId());
            job.setProvider(listing.getProvider());
        }

        job.setTitle(listing.getTitle());
        job.setCompany(listing.getCompany());
        job.setLocation(listing.getLocation());
        job.setEmploymentType(listing.getEmploymentType());
        job.setExperienceLevel(listing.getExperienceLevel());
        job.setSalary(listing.getSalary());
        job.setJobUrl(listing.getJobUrl());
        job.setDescription(listing.getDescription());
        job.setPostedDate(listing.getPostedDate());

        jobRepository.save(job);
    }
}
