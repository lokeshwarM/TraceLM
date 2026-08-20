package com.tracelm.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class PingController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        // Execute a lightweight query to keep the Neon database compute active
        try {
            jdbcTemplate.execute("SELECT 1");
            return ResponseEntity.ok(Map.of(
                    "status", "ACTIVE", 
                    "database", "AWAKE",
                    "message", "Render and Neon instances kept warm."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "ERROR", 
                    "message", e.getMessage()
            ));
        }
    }
}
