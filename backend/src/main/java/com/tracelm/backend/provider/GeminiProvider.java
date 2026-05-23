package com.tracelm.backend.provider;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

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

    @Override
    public String generateResponse(String prompt) {

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

        Map response = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) response.get("candidates");

        Map<String, Object> content =
                (Map<String, Object>) candidates.get(0).get("content");

        List<Map<String, Object>> parts =
                (List<Map<String, Object>>) content.get("parts");

        return parts.get(0).get("text").toString();
    }
}