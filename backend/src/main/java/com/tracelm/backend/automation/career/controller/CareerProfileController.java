package com.tracelm.backend.automation.career.controller;

import com.tracelm.backend.automation.career.dto.CareerProfileDto;
import com.tracelm.backend.automation.career.service.CareerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/automation/career/profile")
@RequiredArgsConstructor
public class CareerProfileController {

    private final CareerProfileService service;

    @GetMapping
    public ResponseEntity<CareerProfileDto> getProfile() {
        return ResponseEntity.ok(service.getProfile());
    }

    @PutMapping
    public ResponseEntity<CareerProfileDto> updateProfile(@RequestBody CareerProfileDto dto) {
        return ResponseEntity.ok(service.updateProfile(dto));
    }

    @PostMapping("/resume")
    public ResponseEntity<CareerProfileDto> uploadResume(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadResume(file));
    }
}
