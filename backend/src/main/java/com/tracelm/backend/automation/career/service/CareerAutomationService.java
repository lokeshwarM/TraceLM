package com.tracelm.backend.automation.career.service;

import com.tracelm.backend.automation.career.entity.CareerProfile;
import com.tracelm.backend.automation.career.repository.CareerProfileRepository;
import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.JobSearchRequest;
import com.tracelm.backend.automation.job.service.JobSearchService;
import com.tracelm.backend.provider.GeminiProvider;
import com.tracelm.backend.entity.Message;
import com.tracelm.backend.dto.LLMResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Collections;
import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class CareerAutomationService {

    private final CareerProfileRepository careerProfileRepository;
    private final JobSearchService jobSearchService;
    private final GeminiProvider geminiProvider;
    private final ObjectMapper objectMapper;

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
        
        List<JobListing> jobs = jobSearchService.searchJobs(request);

        if (jobs == null || jobs.isEmpty()) {
            return Collections.emptyList();
        }

        log.info("Evaluating AI matching scores in batches for {} jobs...", jobs.size());
        
        // Grade jobs in batches of 50 to prevent 429 Too Many Requests
        int batchSize = 50;
        for (int i = 0; i < jobs.size(); i += batchSize) {
            List<JobListing> batch = jobs.subList(i, Math.min(i + batchSize, jobs.size()));
            calculateMatchScores(batch, profile);
            
            // Add a short delay between batches to respect rate limits
            if (i + batchSize < jobs.size()) {
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        // Sort in descending order of matchScore
        jobs.sort((j1, j2) -> {
            int s1 = j1.getMatchScore() != null ? j1.getMatchScore() : 0;
            int s2 = j2.getMatchScore() != null ? j2.getMatchScore() : 0;
            return Integer.compare(s2, s1);
        });

        return jobs;
    }

    private void calculateMatchScores(List<JobListing> batch, CareerProfile profile) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an AI career assistant. Evaluate the match between the candidate's profile/resume and the following list of job listings.\n");
        sb.append("For each job listing, calculate a match score between 0 and 100 (where 0 means no match and 100 means perfect match).\n\n");

        sb.append("### CANDIDATE PREFERENCES\n");
        sb.append("FullName: ").append(profile.getFullName() != null ? profile.getFullName() : "").append("\n");
        sb.append("Headline: ").append(profile.getHeadline() != null ? profile.getHeadline() : "").append("\n");
        sb.append("Years Of Experience: ").append(profile.getYearsOfExperience() != null ? profile.getYearsOfExperience() : "").append("\n");
        sb.append("Preferred Roles: ").append(profile.getPreferredRoles()).append("\n");
        sb.append("Skills: ").append(profile.getSkills()).append("\n");
        sb.append("Preferred Locations: ").append(profile.getPreferredLocations()).append("\n");
        if (profile.getRemoteOnly() != null) {
            sb.append("Remote Only: ").append(profile.getRemoteOnly()).append("\n");
        }
        if (profile.getAdditionalNotes() != null && !profile.getAdditionalNotes().trim().isEmpty()) {
            sb.append("Additional Notes / Theoretical Preferences: ").append(profile.getAdditionalNotes()).append("\n");
        }
        
        if (profile.getResumeContent() != null && !profile.getResumeContent().trim().isEmpty()) {
            sb.append("\n### CANDIDATE RESUME\n");
            sb.append(profile.getResumeContent()).append("\n");
        }

        sb.append("\n### JOB LISTINGS TO EVALUATE\n");
        for (int i = 0; i < batch.size(); i++) {
            JobListing job = batch.get(i);
            sb.append("--- JOB #").append(i + 1).append(" ---\n");
            sb.append("jobId: ").append(job.getJobId()).append("\n");
            sb.append("Title: ").append(job.getTitle()).append("\n");
            sb.append("Company: ").append(job.getCompany()).append("\n");
            sb.append("Location: ").append(job.getLocation()).append("\n");
            String desc = job.getDescription() != null ? job.getDescription() : "No description provided.";
            if (desc.length() > 1000) {
                desc = desc.substring(0, 1000) + "... (truncated)";
            }
            sb.append("Description: ").append(desc).append("\n\n");
        }

        sb.append("Instructions:\n");
        sb.append("Evaluate each job listing and assign a match score from 0 to 100.\n");
        sb.append("Respond with a JSON array containing ONLY objects with 'jobId' (string) and 'score' (integer). Do not include any other markdown formatting, code block markers (like ```json), reasoning, or text. The response should be pure JSON.\n");
        sb.append("Example response format:\n");
        sb.append("[\n");
        sb.append("  {\"jobId\": \"someId\", \"score\": 85}\n");
        sb.append("]\n");

        try {
            Message msg = Message.builder().role("USER").content(sb.toString()).build();
            LLMResponse response = geminiProvider.generateResponse(List.of(msg), "gemini-3.1-flash-lite", false);
            if (response != null && response.getContent() != null) {
                String rawText = response.getContent().trim();
                
                // Clean markdown code blocks if any
                if (rawText.startsWith("```")) {
                    int firstNewLine = rawText.indexOf("\n");
                    if (firstNewLine != -1) {
                        rawText = rawText.substring(firstNewLine).trim();
                    }
                }
                if (rawText.endsWith("```")) {
                    rawText = rawText.substring(0, rawText.lastIndexOf("```")).trim();
                }

                // Parse the scores
                List<ScoreResult> results = objectMapper.readValue(rawText, new TypeReference<List<ScoreResult>>() {});
                
                // Map the results back to the batch
                for (ScoreResult res : results) {
                    for (JobListing job : batch) {
                        if (job.getJobId().equals(res.getJobId())) {
                            job.setMatchScore(res.getScore());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse batch match scores: {}", e.getMessage(), e);
        }
        
        // Default any missing score to 50
        for (JobListing job : batch) {
            if (job.getMatchScore() == null) {
                job.setMatchScore(50);
            }
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ScoreResult {
        private String jobId;
        private int score;
    }
}
