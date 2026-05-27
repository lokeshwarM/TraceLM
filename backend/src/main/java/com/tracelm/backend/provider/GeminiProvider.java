package com.tracelm.backend.provider;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.tracelm.backend.dto.LLMResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import reactor.core.publisher.Flux;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GeminiProvider implements LLMProvider {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.base-url}")
    private String baseUrl;

    @Value("${gemini.default-model}")
    private String defaultModel;

    private String normalizeModelId(String requestedModel) {
        if (requestedModel == null || requestedModel.trim().isEmpty()) {
            return this.defaultModel;
        }
        
        switch (requestedModel.toLowerCase()) {
            case "gemma-4-26b":
                return "gemma-4-26b-a4b-it";
            case "gemma-4-31b":
                return "gemma-4-31b-it";
            case "gemini-3.1-flash-lite":
                return "gemini-3.1-flash-lite";
            default:
                return this.defaultModel;
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public LLMResponse generateResponse(String prompt, String model) {

        WebClient webClient = webClientBuilder.build();
        String selectedModel = normalizeModelId(model);

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

        String url = String.format("%s/%s:generateContent?key=%s", baseUrl.replaceAll("/$", ""), selectedModel, apiKey);

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
                .model(selectedModel)
                .provider("Gemini")
                .build();
    }

    @SuppressWarnings("unchecked")
    @Override
    public Flux<LLMResponse> generateStreamResponse(String prompt, String model) {
        WebClient webClient = webClientBuilder.build();
        String selectedModel = normalizeModelId(model);

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

        String streamUrl = String.format("%s/%s:streamGenerateContent?key=%s&alt=sse", 
                baseUrl.replaceAll("/$", ""), selectedModel, apiKey);

        return webClient.post()
                .uri(streamUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(new org.springframework.core.ParameterizedTypeReference<org.springframework.http.codec.ServerSentEvent<String>>() {})
                .map(sse -> sse.data())
                .filter(json -> json != null && !json.isEmpty())
                .flatMap(json -> {
                    try {
                        Map<String, Object> parsed = objectMapper.readValue(json, Map.class);

                        List<Map<String, Object>> candidates =
                                (List<Map<String, Object>>) parsed.get("candidates");

                        if (candidates != null && !candidates.isEmpty()) {

                            Map<String, Object> content =
                                    (Map<String, Object>) candidates.get(0).get("content");

                            if (content != null) {

                                List<Map<String, Object>> parts =
                                        (List<Map<String, Object>>) content.get("parts");

                                if (parts != null && !parts.isEmpty()) {

                                    Object text = parts.get(0).get("text");

                                    if (text != null && !text.toString().isEmpty()) {
                                        LLMResponse.LLMResponseBuilder builder = LLMResponse.builder()
                                                .content(text.toString())
                                                .provider("Gemini")
                                                .model(selectedModel);

                                        Map<String, Object> usageMetadata =
                                                (Map<String, Object>) parsed.get("usageMetadata");

                                        if (usageMetadata != null) {
                                            Number promptTokensNum = (Number) usageMetadata.get("promptTokenCount");
                                            builder.inputTokens(promptTokensNum != null ? promptTokensNum.intValue() : 0);
                                            
                                            Number outputTokensNum = (Number) usageMetadata.get("candidatesTokenCount");
                                            builder.outputTokens(outputTokensNum != null ? outputTokensNum.intValue() : 0);
                                        } else {
                                            builder.inputTokens(0).outputTokens(0);
                                        }

                                        return Flux.just(builder.build());
                                    }
                                }
                            }
                        } else {
                            // usageMetadata without candidates might be sent at the end
                            Map<String, Object> usageMetadata =
                                    (Map<String, Object>) parsed.get("usageMetadata");

                            if (usageMetadata != null) {
                                LLMResponse.LLMResponseBuilder builder = LLMResponse.builder()
                                        .content("")
                                        .provider("Gemini")
                                        .model(selectedModel);

                                Number promptTokensNum = (Number) usageMetadata.get("promptTokenCount");
                                builder.inputTokens(promptTokensNum != null ? promptTokensNum.intValue() : 0);
                                
                                Number outputTokensNum = (Number) usageMetadata.get("candidatesTokenCount");
                                builder.outputTokens(outputTokensNum != null ? outputTokensNum.intValue() : 0);

                                return Flux.just(builder.build());
                            }
                        }

                        return Flux.empty();

                    } catch (Exception e) {
                        System.err.println("Failed to parse SSE chunk: " + e.getMessage());
                        return Flux.empty();
                    }
                })
                .onErrorResume(e -> {
                    System.err.println("SSE Stream error: " + e.getMessage());
                    return Flux.empty();
                });
    }
}