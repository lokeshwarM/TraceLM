package com.tracelm.backend.provider;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.tracelm.backend.dto.LLMResponse;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GeminiProvider implements LLMProvider {

    private final WebClient.Builder webClientBuilder;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.url}")
    private String apiUrl;

    @Value("${gemini.model}")
    private String model;

    @SuppressWarnings("unchecked")
    @Override
    public LLMResponse generateResponse(String prompt) {

        WebClient webClient = webClientBuilder.build();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of(
                                                "text", prompt
                                        )
                                )
                        )
                )
        );

        String url = String.format("%s?key=%s", apiUrl, apiKey);

        Map<String, Object> response = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) {
            throw new RuntimeException("Null response from Gemini API");
        }

        List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) response.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            throw new RuntimeException("Gemini API returned empty candidates");
        }

        Map<String, Object> content =
                (Map<String, Object>) candidates.get(0).get("content");

        List<Map<String, Object>> parts =
                (List<Map<String, Object>>) content.get("parts");

        String aiText = parts.get(0).get("text").toString();

        Map<String, Object> usageMetadata =
                (Map<String, Object>) response.get("usageMetadata");
        
        int promptTokens = 0;
        int outputTokens = 0;
        
        if (usageMetadata != null) {
            Number promptTokensNum = (Number) usageMetadata.get("promptTokenCount");
            promptTokens = promptTokensNum != null ? promptTokensNum.intValue() : 0;
            
            Number outputTokensNum = (Number) usageMetadata.get("candidatesTokenCount");
            outputTokens = outputTokensNum != null ? outputTokensNum.intValue() : 0;
        }

        return LLMResponse.builder()
                .content(aiText)
                .inputTokens(promptTokens)
                .outputTokens(outputTokens)
                .model(model)
                .provider("Gemini")
                .build();
    }
}