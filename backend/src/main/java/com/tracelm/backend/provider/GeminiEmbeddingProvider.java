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
public class GeminiEmbeddingProvider implements EmbeddingProvider {

    private final WebClient.Builder webClientBuilder;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.base-url}")
    private String baseUrl;

    @SuppressWarnings("unchecked")
    @Override
    public float[] generateEmbedding(String text) {
        WebClient webClient = webClientBuilder.build();

        Map<String, Object> requestBody = Map.of(
                "model", "models/gemini-embedding-2",
                "content", Map.of(
                        "parts", List.of(Map.of("text", text))
                ),
                "outputDimensionality", 768
        );

        String url = String.format("%s/gemini-embedding-2:embedContent?key=%s", baseUrl.replaceAll("/$", ""), apiKey);

        Map<String, Object> response = webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || !response.containsKey("embedding")) {
            throw new RuntimeException("Failed to generate embedding: empty response from Gemini");
        }

        Map<String, Object> embeddingNode = (Map<String, Object>) response.get("embedding");
        List<Number> values = (List<Number>) embeddingNode.get("values");

        float[] result = new float[values.size()];
        for (int i = 0; i < values.size(); i++) {
            result[i] = values.get(i).floatValue();
        }

        return result;
    }
}
