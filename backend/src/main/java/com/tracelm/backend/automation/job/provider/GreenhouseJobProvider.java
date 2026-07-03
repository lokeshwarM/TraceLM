package com.tracelm.backend.automation.job.provider;

import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.JobSearchRequest;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
public class GreenhouseJobProvider implements JobProvider {

    private final WebClient webClient;
    private final String baseUrl;
    private final String boardToken;

    public GreenhouseJobProvider(
            WebClient.Builder webClientBuilder,
            @Value("${automation.providers.greenhouse.url:https://boards-api.greenhouse.io/v1/boards}") String baseUrl,
            @Value("${automation.providers.greenhouse.board-token:github}") String boardToken) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.baseUrl = baseUrl;
        this.boardToken = boardToken;
    }

    @Override
    public String getProviderName() {
        return "Greenhouse";
    }

    @Override
    public List<JobListing> searchJobs(JobSearchRequest request) {
        try {
            GreenhouseResponse response = webClient.get()
                    .uri("/{boardToken}/jobs?content=true", boardToken)
                    .retrieve()
                    .bodyToMono(GreenhouseResponse.class)
                    .block();

            if (response == null || response.getJobs() == null) {
                return Collections.emptyList();
            }

            return response.getJobs().stream()
                    .map(this::mapToJobListing)
                    .filter(job -> matchesFilter(job, request))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to fetch jobs from Greenhouse API for board: {}", boardToken, e);
            return Collections.emptyList();
        }
    }

    private boolean matchesFilter(JobListing job, JobSearchRequest request) {
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            String keyword = request.getKeyword().toLowerCase();
            boolean matchesTitle = job.getTitle() != null && job.getTitle().toLowerCase().contains(keyword);
            boolean matchesDesc = job.getDescription() != null && job.getDescription().toLowerCase().contains(keyword);
            if (!matchesTitle && !matchesDesc) {
                return false;
            }
        }
        if (request.getLocation() != null && !request.getLocation().isEmpty()) {
            if (job.getLocation() == null || !job.getLocation().toLowerCase().contains(request.getLocation().toLowerCase())) {
                return false;
            }
        }
        return true;
    }

    private JobListing mapToJobListing(GreenhouseJob gJob) {
        String location = gJob.getLocation() != null ? gJob.getLocation().getName() : "Unknown";
        String description = gJob.getContent() != null ? gJob.getContent() : "";

        LocalDateTime postedDate = null;
        try {
            if (gJob.getUpdated_at() != null) {
                postedDate = ZonedDateTime.parse(gJob.getUpdated_at()).toLocalDateTime();
            }
        } catch (Exception e) {
            log.warn("Failed to parse date for job {}: {}", gJob.getId(), gJob.getUpdated_at());
        }

        return JobListing.builder()
                .jobId(String.valueOf(gJob.getId()))
                .title(gJob.getTitle())
                .company(boardToken)
                .location(location)
                .employmentType("Full-Time") // Greenhouse API does not always expose this natively in standard list
                .experienceLevel("Any")
                .salary("Not specified")
                .jobUrl(gJob.getAbsolute_url())
                .provider(getProviderName())
                .description(description)
                .postedDate(postedDate) // Approximation for posted date
                .build();
    }

    @Data
    private static class GreenhouseResponse {
        private List<GreenhouseJob> jobs;
    }

    @Data
    private static class GreenhouseJob {
        private long id;
        private String title;
        private String absolute_url;
        private String updated_at;
        private String content;
        private GreenhouseLocation location;
    }

    @Data
    private static class GreenhouseLocation {
        private String name;
    }
}
