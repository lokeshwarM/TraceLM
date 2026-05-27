package com.tracelm.backend.service;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class RegexPiiDetectorService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}");

    private static final String[] COMPLEX_KEYWORDS = {
        "password", "wifi", "secret", "token", "otp", "api key", "credential"
    };

    public boolean containsComplexPii(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        for (String keyword : COMPLEX_KEYWORDS) {
            if (lower.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    public boolean containsSimplePii(String text) {
        if (text == null) return false;
        return EMAIL_PATTERN.matcher(text).find() || PHONE_PATTERN.matcher(text).find();
    }

    public String redactSimplePii(String text) {
        if (text == null) return null;
        String result = EMAIL_PATTERN.matcher(text).replaceAll("[REDACTED_EMAIL]");
        result = PHONE_PATTERN.matcher(result).replaceAll("[REDACTED_PHONE]");
        return result;
    }
}
