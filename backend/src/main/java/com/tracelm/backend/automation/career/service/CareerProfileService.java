package com.tracelm.backend.automation.career.service;

import com.tracelm.backend.automation.career.dto.CareerProfileDto;
import com.tracelm.backend.automation.career.entity.CareerProfile;
import com.tracelm.backend.automation.career.repository.CareerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareerProfileService {

    private final CareerProfileRepository repository;

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

        profile = repository.save(profile);
        return mapToDto(profile);
    }

    private CareerProfileDto mapToDto(CareerProfile profile) {
        CareerProfileDto dto = new CareerProfileDto();
        BeanUtils.copyProperties(profile, dto);
        return dto;
    }
}
