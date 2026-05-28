package com.tracelm.backend.service;

import com.tracelm.backend.entity.User;
import com.tracelm.backend.repository.UserRepository;
import com.tracelm.backend.security.JwtService;
import com.tracelm.backend.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RestTemplate restTemplate = new RestTemplate();

    public AuthResponse authenticate(String idToken) {
        // Validate with Google
        String url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + idToken;
        ResponseEntity<Map> response;
        try {
            response = restTemplate.getForEntity(url, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid Google token");
        }

        Map<String, Object> payload = response.getBody();
        if (payload == null || !payload.containsKey("email")) {
            throw new RuntimeException("Invalid token payload");
        }

        String email = (String) payload.get("email");
        String name = (String) payload.getOrDefault("name", email);
        String picture = (String) payload.get("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .pictureUrl(picture)
                    .provider("GOOGLE")
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
