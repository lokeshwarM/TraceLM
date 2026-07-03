package com.tracelm.backend.automation.job.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSearchRequest {
    private String keyword;
    private String location;
    private String experience;
    private boolean remoteOnly;
    @Min(value = 0, message = "Page must be zero or positive")
    private int page;
    
    @Builder.Default
    @Min(value = 1, message = "PageSize must be greater than zero")
    private int pageSize = 10;
}
