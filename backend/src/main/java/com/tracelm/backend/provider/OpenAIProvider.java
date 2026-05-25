package com.tracelm.backend.provider;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.tracelm.backend.dto.LLMResponse;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OpenAIProvider implements LLMProvider {

    private final WebClient.Builder webClientBuilder;

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    @SuppressWarnings("unchecked")
    @Override
    public LLMResponse generateResponse(String prompt, String model) {

        WebClient webClient = webClientBuilder.build();

        String selectedModel = (model != null && !model.trim().isEmpty()) ? model : this.model;

        Map<String, Object> requestBody = Map.of(
                "model", selectedModel,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        );

        Map<String, Object> response = webClient.post()
                .uri("https://api.openai.com/v1/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) {
            throw new RuntimeException("Null response from OpenAI API");
        }

        List<Map<String, Object>> choices =
                (List<Map<String, Object>>) response.get("choices");

        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("OpenAI API returned empty choices");
        }

        Map<String, Object> message =
                (Map<String, Object>) choices.get(0).get("message");

        String aiText = message.get("content").toString();

        Map<String, Object> usage = (Map<String, Object>) response.get("usage");
        int promptTokens = 0;
        int outputTokens = 0;

        if (usage != null) {
            Number promptTokensNum = (Number) usage.get("prompt_tokens");
            promptTokens = promptTokensNum != null ? promptTokensNum.intValue() : 0;

            Number outputTokensNum = (Number) usage.get("completion_tokens");
            outputTokens = outputTokensNum != null ? outputTokensNum.intValue() : 0;
        }

        return LLMResponse.builder()
                .content(aiText)
                .inputTokens(promptTokens)
                .outputTokens(outputTokens)
                .model(selectedModel)
                .provider("OpenAI")
                .build();
    }
}