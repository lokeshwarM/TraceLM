package com.tracelm.backend.automation.career.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "career_profiles")
@Data
@NoArgsConstructor
public class CareerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = true)
    private UUID userId;

    private String fullName;
    private String headline;
    private Integer yearsOfExperience;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "career_profile_preferred_roles")
    private List<String> preferredRoles = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "career_profile_skills")
    private List<String> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "career_profile_preferred_locations")
    private List<String> preferredLocations = new ArrayList<>();

    private Boolean remoteOnly;
    private Integer minimumSalary;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "career_profile_employment_types")
    private List<String> preferredEmploymentTypes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "career_profile_preferred_companies")
    private List<String> preferredCompanies = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "career_profile_excluded_keywords")
    private List<String> excludedKeywords = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
