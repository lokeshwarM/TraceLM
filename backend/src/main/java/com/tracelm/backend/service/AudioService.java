package com.tracelm.backend.service;

import com.tracelm.backend.dto.TranscriptionResponse;
import com.tracelm.backend.provider.TranscriptionProvider;
import com.tracelm.backend.entity.User;
import com.tracelm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AudioService {

    private final TranscriptionProvider transcriptionProvider;
    private final UserRepository userRepository;

    public TranscriptionResponse transcribe(MultipartFile audioFile, String userIdStr) {
        long startTime = System.currentTimeMillis();
        int sizeBytes = 0;
        User user = null;
        
        try {
            if (userIdStr != null && !userIdStr.trim().isEmpty()) {
                user = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
            }
            
            sizeBytes = (int) audioFile.getSize();
            byte[] audioData = audioFile.getBytes();
            String mimeType = audioFile.getContentType();
            
            if (mimeType == null || mimeType.isEmpty()) {
                mimeType = "audio/webm";
            }
            
            // For Phase 1 Voice, gemini-3.1-flash-lite is the requested model
            String text = transcriptionProvider.transcribeAudio(audioData, mimeType, "gemini-3.1-flash-lite");
            
            long latency = System.currentTimeMillis() - startTime;
            
            System.out.println("[STT] Audio Transcription Request: Latency " + latency + "ms, Size " + sizeBytes + " bytes");
            
            return TranscriptionResponse.builder()
                    .text(text)
                    .latencyMs(latency)
                    .audioSizeBytes(sizeBytes)
                    .status("SUCCESS")
                    .build();
                    
        } catch (Exception e) {
            e.printStackTrace();
            long latency = System.currentTimeMillis() - startTime;
            
            System.out.println("[STT] Audio Transcription Failed: Latency " + latency + "ms, Error: " + e.getMessage());
            
            return TranscriptionResponse.builder()
                    .text("")
                    .latencyMs(latency)
                    .audioSizeBytes(sizeBytes)
                    .status("FAILED: " + e.getMessage())
                    .build();
        }
    }
}
