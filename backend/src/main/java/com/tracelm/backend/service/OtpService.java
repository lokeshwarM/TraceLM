package com.tracelm.backend.service;

import com.tracelm.backend.entity.User;
import com.tracelm.backend.repository.UserRepository;
import com.tracelm.backend.security.JwtService;
import com.tracelm.backend.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final Optional<JavaMailSender> mailSender; // Assuming spring-boot-starter-mail is configured

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private static class OtpData {
        String otp;
        Instant expiry;
        OtpData(String otp, Instant expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    public void sendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        // Valid for 5 minutes
        otpStorage.put(email, new OtpData(otp, Instant.now().plusSeconds(300)));

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("TraceLM Authentication Code");
            message.setText("Your TraceLM login code is: " + otp + "\n\nThis code will expire in 5 minutes.");
            if (mailSender.isPresent()) {
                mailSender.get().send(message);
            } else {
                System.out.println("SMTP not configured. OTP for " + email + " is " + otp);
            }
        } catch (Exception e) {
            // Log error, but for local dev we might print to console if no SMTP
            System.out.println("SMTP not configured. OTP for " + email + " is " + otp);
        }
    }

    public AuthResponse verifyOtp(String email, String otp) {
        OtpData data = otpStorage.get(email);
        if (data == null || data.expiry.isBefore(Instant.now()) || !data.otp.equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        otpStorage.remove(email);

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            user = User.builder()
                    .email(email)
                    .name(email.split("@")[0])
                    .provider("OTP")
                    .build();
            user = userRepository.save(user);
        }

        String jwt = jwtService.generateToken(user.getId().toString());

        AuthResponse.UserDto userDto = new AuthResponse.UserDto();
        userDto.setId(user.getId().toString());
        userDto.setEmail(user.getEmail());
        userDto.setName(user.getName());
        userDto.setPictureUrl(user.getPictureUrl());

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(jwt);
        authResponse.setUser(userDto);

        return authResponse;
    }
}
