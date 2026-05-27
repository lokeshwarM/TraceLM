package com.tracelm.backend.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class PiiPipelineService {

    private static final Logger log = LoggerFactory.getLogger(PiiPipelineService.class);

    private final RegexPiiDetectorService regexDetector;
    private final AiPiiRedactionService aiRedactor;

    @Data
    public static class PiiResult {
        private final String sanitizedText;
        private final boolean wasRedacted;
    }

    public PiiResult sanitize(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new PiiResult(text, false);
        }

        if (regexDetector.containsComplexPii(text)) {
            log.info("Complex PII detected (keywords matched). Engaging AI Middleware.");
            String sanitized = aiRedactor.redactPii(text);
            boolean redacted = !text.equals(sanitized);
            return new PiiResult(sanitized, redacted);
        }

        if (regexDetector.containsSimplePii(text)) {
            log.info("Simple PII detected (regex matched). Redacting locally.");
            String sanitized = regexDetector.redactSimplePii(text);
            return new PiiResult(sanitized, true);
        }

        return new PiiResult(text, false);
    }
}
