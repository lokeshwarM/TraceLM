package com.tracelm.backend.controller;

import com.tracelm.backend.service.GoogleAuthService;
import com.tracelm.backend.service.OtpService;
import com.tracelm.backend.dto.AuthResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tracelm.backend.repository.UserRepository;
import com.tracelm.backend.entity.User;
import java.security.Principal;
import java.util.UUID;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GoogleAuthService googleAuthService;
    private final OtpService otpService;
    private final UserRepository userRepository;

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

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userRepository.findById(UUID.fromString(principal.getName())).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(new UserResponse(user.getId().toString(), user.getName(), user.getEmail()));
    }

    @Data
    public static class UserResponse {
        private String id;
        private String name;
        private String email;
        public UserResponse(String id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }
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
