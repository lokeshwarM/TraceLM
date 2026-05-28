package com.tracelm.backend.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private UserDto user;

    @Data
    public static class UserDto {
        private String id;
        private String email;
        private String name;
        private String pictureUrl;
    }
}
