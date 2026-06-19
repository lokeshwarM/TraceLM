package com.tracelm.backend.service;

import org.springframework.stereotype.Service;
import com.tracelm.backend.provider.LLMProvider;
import com.tracelm.backend.dto.LLMResponse;
import com.tracelm.backend.entity.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import java.util.List;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class PiiRedactionService {
    private static final Logger log = LoggerFactory.getLogger(PiiRedactionService.class);
    
    @Qualifier("geminiProvider")
    private final LLMProvider geminiProvider;
    private static final String MIDDLEWARE_MODEL = "gemma-4-31b-it";
    
    // Regex Patterns for pre-check
    private static final Pattern[] SUSPICIOUS_PATTERNS = {
        Pattern.compile("(?i)(password|pass|pwd)\\s*(is|=|:)\\s*\\S+"),
        Pattern.compile("(?i)(pin)\\s*(is|=|:)\\s*\\d+"),
        Pattern.compile("(?i)(otp)\\s*(is|=|:)\\s*\\d+"),
        Pattern.compile("(?i)(api[\\s_-]?key|token|secret)\\s*(is|=|:)\\s*\\S+"),
        Pattern.compile("\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b"), // CC
        Pattern.compile("(?i)cvv\\s*(is|=|:)?\\s*\\d{3,4}"), // CVV
        Pattern.compile("\\b\\d{4}\\s\\d{4}\\s\\d{4}\\b"), // Aadhaar
        Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"), // Email
        Pattern.compile("(\\+\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}") // Phone
    };

    private static final String PROMPT_TEMPLATE = 
        "Redact all personally identifiable information and secrets from the following text.\n\n" +
        "Replace sensitive values with placeholders such as:\n" +
        "[REDACTED_EMAIL]\n" +
        "[REDACTED_PHONE]\n" +
        "[REDACTED_PASSWORD]\n" +
        "[REDACTED_API_KEY]\n" +
        "[REDACTED_PIN]\n" +
        "[REDACTED_OTP]\n" +
        "[REDACTED_CC]\n" +
        "[REDACTED_CVV]\n" +
        "[REDACTED_AADHAAR]\n\n" +
        "Return ONLY the sanitized text, nothing else.\n\n" +
        "Text:\n%s";

    public String sanitize(String prompt) {
        log.info("[RAW_PROMPT_RECEIVED] Checking for PII...");
        
        boolean needsSanitization = false;
        for (Pattern p : SUSPICIOUS_PATTERNS) {
            if (p.matcher(prompt).find()) {
                needsSanitization = true;
                break;
            }
        }
        
        if (!needsSanitization) {
            return prompt;
        }
        
        log.info("[REGEX_PII_MATCH] Suspicious patterns detected.");
        log.info("[MIDDLEWARE_PII_ANALYSIS_STARTED] Engaging Gemma 31B middleware...");
        
        try {
            String middlewarePrompt = String.format(PROMPT_TEMPLATE, prompt);
            Message msg = Message.builder().role("USER").content(middlewarePrompt).build();
            LLMResponse response = geminiProvider.generateResponse(List.of(msg), MIDDLEWARE_MODEL, false);
            String sanitized = response.getContent() != null ? response.getContent().trim() : prompt;
            log.info("[SANITIZED_PROMPT] Redaction complete.");
            log.info("[PROVIDER_REQUEST_STARTED] Preparing to route sanitized prompt.");
            return sanitized;
        } catch (Exception e) {
            log.error("Middleware failed, falling back to original. Error: {}", e.getMessage());
            return prompt;
        }
    }
}
