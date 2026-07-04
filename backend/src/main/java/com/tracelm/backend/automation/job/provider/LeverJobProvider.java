package com.tracelm.backend.automation.job.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tracelm.backend.automation.job.dto.JobListing;
import com.tracelm.backend.automation.job.dto.JobSearchRequest;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class LeverJobProvider implements JobProvider {

    private final WebClient webClient;
    private final List<String> boards;

    public LeverJobProvider(
            WebClient.Builder webClientBuilder,
            @Value("${automation.providers.lever.url:https://api.lever.co/v0/postings}") String baseUrl,
            @Value("${automation.lever.boards:#{null}}") List<String> boards) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.boards = boards;
    }

    @Override
    public String getProviderName() {
        return "Lever";
    }

    @Override
    public List<JobListing> searchJobs(JobSearchRequest request) {
        if (boards == null || boards.isEmpty() || (boards.size() == 1 && boards.get(0).trim().isEmpty())) {
            log.warn("No Lever boards configured. Skipping Lever job fetch.");
            return Collections.emptyList();
        }

        List<JobListing> allJobs = new ArrayList<>();

        for (String board : boards) {
            List<JobListing> boardJobs = fetchJobsForBoard(board);
            allJobs.addAll(boardJobs);
        }

        return allJobs.stream()
                .filter(job -> matchesFilter(job, request))
                .collect(Collectors.toList());
    }

    private List<JobListing> fetchJobsForBoard(String board) {
        try {
            // Public endpoint format: https://api.lever.co/v0/postings/{company}?mode=json
            LeverPosting[] response = webClient.get()
                    .uri("/{board}?mode=json", board)
                    .retrieve()
                    .bodyToMono(LeverPosting[].class)
                    .block();

            if (response == null) {
                return Collections.emptyList();
            }

            List<JobListing> list = new ArrayList<>();
            for (LeverPosting post : response) {
                list.add(mapToJobListing(post, board));
            }
            return list;

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException.NotFound e) {
            log.warn("Lever board '{}' returned 404 Not Found. Skipping...", board);
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to fetch jobs from Lever API for board: {}", board, e);
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

    private JobListing mapToJobListing(LeverPosting lJob, String board) {
        String location = "Unknown";
        String commitment = "Full-Time";
        
        if (lJob.getCategories() != null) {
            if (lJob.getCategories().getLocation() != null) {
                location = lJob.getCategories().getLocation();
            }
            if (lJob.getCategories().getCommitment() != null) {
                commitment = lJob.getCategories().getCommitment();
            }
        }

        String url = lJob.getUrls() != null ? lJob.getUrls().getShow() : "https://jobs.lever.co/" + board;

        return JobListing.builder()
                .jobId(lJob.getId())
                .title(lJob.getTitle())
                .company(board)
                .location(location)
                .employmentType(commitment)
                .experienceLevel("Any")
                .salary("Not specified")
                .jobUrl(url)
                .provider(getProviderName())
                .description(lJob.getDescription() != null ? lJob.getDescription() : "")
                .postedDate(LocalDateTime.now()) // Lever public feed doesn't contain a clear posted date on list
                .build();
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LeverPosting {
        private String id;
        private String title;
        private LeverCategories categories;
        private String description;
        private String workplaceType;
        private LeverUrls urls;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LeverCategories {
        private String location;
        private String commitment;
        private String team;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class LeverUrls {
        private String list;
        private String show;
        private String apply;
    }
}
