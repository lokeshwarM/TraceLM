package com.tracelm.backend.automation.career.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
public class CareerProfileDto {
    private UUID id;
    private UUID userId;
    private String fullName = "";
    private String headline = "";
    private Integer yearsOfExperience = 0;
    private List<String> preferredRoles = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private List<String> preferredLocations = new ArrayList<>();
    private Boolean remoteOnly = false;
    private Integer minimumSalary = 0;
    private List<String> preferredEmploymentTypes = new ArrayList<>();
    private List<String> preferredCompanies = new ArrayList<>();
    private List<String> excludedKeywords = new ArrayList<>();
    private String resumeFileName = "";
    private String resumeContent = "";
    private String additionalNotes = "";
}
