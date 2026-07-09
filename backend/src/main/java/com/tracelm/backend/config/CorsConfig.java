package com.tracelm.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        String allowedOrigin = System.getenv("FRONTEND_URL");
        if (allowedOrigin != null && !allowedOrigin.isEmpty()) {
            config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://192.168.0.108:3000", allowedOrigin));
        } else {
            // Allow all Vercel domains as a fallback if specific URL isn't set
            config.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://192.168.0.108:3000", "https://*.vercel.app"));
        }
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
