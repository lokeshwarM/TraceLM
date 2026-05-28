package com.tracelm.backend.controller;

import com.tracelm.backend.service.GoogleAuthService;
import com.tracelm.backend.service.OtpService;
import com.tracelm.backend.dto.AuthResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GoogleAuthService googleAuthService;
    private final OtpService otpService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody TokenRequest request) {
        return ResponseEntity.ok(googleAuthService.authenticate(request.getToken()));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<Void> sendOtp(@RequestBody EmailRequest request) {
        otpService.sendOtp(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody OtpRequest request) {
        return ResponseEntity.ok(otpService.verifyOtp(request.getEmail(), request.getOtp()));
    }

    @Data
    public static class TokenRequest {
        private String token;
    }

    @Data
    public static class EmailRequest {
        private String email;
    }

    @Data
    public static class OtpRequest {
        private String email;
        private String otp;
    }
}
