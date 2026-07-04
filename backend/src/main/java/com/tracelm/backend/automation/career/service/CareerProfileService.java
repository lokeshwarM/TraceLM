package com.tracelm.backend.automation.career.service;

import com.tracelm.backend.automation.career.dto.CareerProfileDto;
import com.tracelm.backend.automation.career.entity.CareerProfile;
import com.tracelm.backend.automation.career.repository.CareerProfileRepository;
import com.tracelm.backend.service.DocumentExtractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareerProfileService {

    private final CareerProfileRepository repository;
    private final DocumentExtractionService extractionService;

    @Transactional(readOnly = true)
    public CareerProfileDto getProfile() {
        // Auth not integrated yet, return first profile or sensible default
        List<CareerProfile> profiles = repository.findAll();
        if (profiles.isEmpty()) {
            return new CareerProfileDto();
        }
        return mapToDto(profiles.get(0));
    }

    @Transactional
    public CareerProfileDto updateProfile(CareerProfileDto dto) {
        List<CareerProfile> profiles = repository.findAll();
        CareerProfile profile;
        
        if (profiles.isEmpty()) {
            profile = new CareerProfile();
        } else {
            profile = profiles.get(0);
        }

        profile.setFullName(dto.getFullName());
        profile.setHeadline(dto.getHeadline());
        profile.setYearsOfExperience(dto.getYearsOfExperience());
        profile.setPreferredRoles(dto.getPreferredRoles());
        profile.setSkills(dto.getSkills());
        profile.setPreferredLocations(dto.getPreferredLocations());
        profile.setRemoteOnly(dto.getRemoteOnly());
        profile.setMinimumSalary(dto.getMinimumSalary());
        profile.setPreferredEmploymentTypes(dto.getPreferredEmploymentTypes());
        profile.setPreferredCompanies(dto.getPreferredCompanies());
        profile.setExcludedKeywords(dto.getExcludedKeywords());
        profile.setAdditionalNotes(dto.getAdditionalNotes());
        // Do not overwrite resume content on profile settings update unless provided in DTO
        if (dto.getResumeFileName() != null && !dto.getResumeFileName().isEmpty()) {
            profile.setResumeFileName(dto.getResumeFileName());
            profile.setResumeContent(dto.getResumeContent());
        }

        profile = repository.save(profile);
        return mapToDto(profile);
    }

    @Transactional
    public CareerProfileDto uploadResume(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF resumes are supported");
        }
        try {
            var result = extractionService.extractText(file);
            List<CareerProfile> profiles = repository.findAll();
            CareerProfile profile;
            if (profiles.isEmpty()) {
                profile = new CareerProfile();
            } else {
                profile = profiles.get(0);
            }
            profile.setResumeFileName(file.getOriginalFilename());
            profile.setResumeContent(result.text());
            profile = repository.save(profile);
            return mapToDto(profile);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process resume PDF: " + e.getMessage(), e);
        }
    }

    private CareerProfileDto mapToDto(CareerProfile profile) {
        CareerProfileDto dto = new CareerProfileDto();
        BeanUtils.copyProperties(profile, dto);
        return dto;
    }
}
