package com.tracelm.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class DatabaseConfig {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
    }
}
