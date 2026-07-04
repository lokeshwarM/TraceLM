package com.tracelm.backend.automation.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobListing {
    private String jobId;
    private String title;
    private String company;
    private String location;
    private String employmentType;
    private String experienceLevel;
    private String salary;
    private String jobUrl;
    private String provider;
    private String description;
    private LocalDateTime postedDate;
    private Integer matchScore;
}
