package com.tracelm.backend.service;

import org.springframework.stereotype.Service;
import com.tracelm.backend.provider.LLMProvider;
import com.tracelm.backend.dto.LLMResponse;
import com.tracelm.backend.entity.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AiPiiRedactionService {

    private static final Logger log = LoggerFactory.getLogger(AiPiiRedactionService.class);

    @Qualifier("geminiProvider")
    private final LLMProvider geminiProvider;

    private static final String MIDDLEWARE_MODEL = "gemma-4-31b-it";
    
    private static final String PROMPT_TEMPLATE = 
        "Redact all personally identifiable information and secrets from the following text.\n\n" +
        "Replace sensitive values with placeholders:\n" +
        "[REDACTED_EMAIL]\n" +
        "[REDACTED_PHONE]\n" +
        "[REDACTED_PASSWORD]\n" +
        "[REDACTED_API_KEY]\n\n" +
        "Return ONLY sanitized text.\n\n" +
        "Text:\n%s";

    public String redactPii(String text) {
        try {
            log.info("Triggering AiPiiRedactionService middleware (Model: {})", MIDDLEWARE_MODEL);
            String prompt = String.format(PROMPT_TEMPLATE, text);
            Message msg = Message.builder().role("USER").content(prompt).build();
            LLMResponse response = geminiProvider.generateResponse(List.of(msg), MIDDLEWARE_MODEL, false);
            log.info("AiPiiRedactionService middleware sanitization completed.");
            return response.getContent() != null ? response.getContent().trim() : text;
        } catch (Exception e) {
            log.error("AiPiiRedactionService failed: {}", e.getMessage());
            return text;
        }
    }
}
