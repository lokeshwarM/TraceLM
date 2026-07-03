package com.tracelm.backend.automation.job.service;

import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.SavedJobDto;
import com.tracelm.backend.automation.job.entity.Job;
import com.tracelm.backend.automation.job.entity.SavedJob;
import com.tracelm.backend.automation.job.repository.JobRepository;
import com.tracelm.backend.automation.job.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;

    @Transactional
    public SavedJobDto saveJob(UUID jobId, UUID currentUserId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Optional<SavedJob> existingSavedJob = savedJobRepository.findByUserIdAndJobId(currentUserId, jobId);
        
        SavedJob savedJob;
        if (existingSavedJob.isPresent()) {
            savedJob = existingSavedJob.get();
        } else {
            savedJob = SavedJob.builder()
                    .userId(currentUserId)
                    .job(job)
                    .savedAt(LocalDateTime.now())
                    .build();
            savedJob = savedJobRepository.save(savedJob);
        }

        return mapToDto(savedJob);
    }

    @Transactional
    public void unsaveJob(UUID jobId, UUID currentUserId) {
        
        if (!jobRepository.existsById(jobId)) {
            throw new RuntimeException("Job not found");
        }
        
        savedJobRepository.deleteByUserIdAndJobId(currentUserId, jobId);
    }

    @Transactional(readOnly = true)
    public List<SavedJobDto> getSavedJobs(UUID currentUserId) {
        
        return savedJobRepository.findByUserIdOrderBySavedAtDesc(currentUserId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private SavedJobDto mapToDto(SavedJob savedJob) {
        Job job = savedJob.getJob();
        JobListing jobListing = JobListing.builder()
                .jobId(job.getExternalJobId())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType())
                .experienceLevel(job.getExperienceLevel())
                .salary(job.getSalary())
                .jobUrl(job.getJobUrl())
                .provider(job.getProvider())
                .description(job.getDescription())
                .postedDate(job.getPostedDate())
                .build();

        return SavedJobDto.builder()
                .id(savedJob.getId())
                .job(jobListing)
                .savedAt(savedJob.getSavedAt())
                .build();
    }
}
