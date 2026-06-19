package com.tracelm.backend.controller;

import com.tracelm.backend.dto.TranscriptionResponse;
import com.tracelm.backend.service.AudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/audio")
@RequiredArgsConstructor
public class AudioController {

    private final AudioService audioService;

    @PostMapping("/transcribe")
    public ResponseEntity<TranscriptionResponse> transcribeAudio(
            @RequestParam("audio") MultipartFile audioFile,
            Principal principal) {
        
        String userId = principal != null ? principal.getName() : null;
        TranscriptionResponse response = audioService.transcribe(audioFile, userId);
        
        if (response.getStatus().startsWith("FAILED")) {
            return ResponseEntity.internalServerError().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
}
