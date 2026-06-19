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

import com.tracelm.backend.entity.Message;

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

    private List<Map<String, Object>> mapToGeminiContents(List<Message> messages) {
        List<Map<String, Object>> contents = new java.util.ArrayList<>();
        for (Message msg : messages) {
            String role = "ASSISTANT".equalsIgnoreCase(msg.getRole()) ? "model" : "user";
            contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", msg.getContent() != null ? msg.getContent() : ""))
            ));
        }
        return contents;
    }

    @SuppressWarnings("unchecked")
    @Override
    public LLMResponse generateResponse(List<Message> messages, String model, boolean voiceOutput) {

        WebClient webClient = webClientBuilder.build();
        String selectedModel = normalizeModelId(model);

        Map<String, Object> requestBody = new java.util.HashMap<>();
        requestBody.put("contents", mapToGeminiContents(messages));
        
        if (voiceOutput) {
            // For audio output, gemini-2.5-flash is currently required. 3.1-flash-lite might not support it.
            selectedModel = "gemini-2.5-flash"; 
            requestBody.put("generationConfig", Map.of(
                "responseModalities", List.of("AUDIO")
            ));
        }

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

        String aiText = "";
        String audioData = null;
        
        for (Map<String, Object> part : parts) {
            if (part.containsKey("text")) {
                aiText += part.get("text").toString();
            }
            if (part.containsKey("inlineData")) {
                Map<String, Object> inlineData = (Map<String, Object>) part.get("inlineData");
                if (inlineData != null && inlineData.containsKey("data")) {
                    audioData = inlineData.get("data").toString();
                }
            }
        }

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
                .audioData(audioData)
                .build();
    }

    @SuppressWarnings("unchecked")
    @Override
    public Flux<LLMResponse> generateStreamResponse(List<Message> messages, String model, boolean voiceOutput) {
        WebClient webClient = webClientBuilder.build();
        String tempModel = normalizeModelId(model);

        Map<String, Object> requestBody = new java.util.HashMap<>();
        requestBody.put("contents", mapToGeminiContents(messages));
        
        final String finalSelectedModel = tempModel;

        String streamUrl = String.format("%s/%s:streamGenerateContent?key=%s&alt=sse", 
                baseUrl.replaceAll("/$", ""), finalSelectedModel, apiKey);

        if (voiceOutput) {
            System.out.println("[VOICE] Gemini request started");
        }
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

                                    String chunkText = "";
                                    String chunkAudio = null;

                                    for (Map<String, Object> part : parts) {
                                        if (part.containsKey("text") && part.get("text") != null) {
                                            chunkText += part.get("text").toString();
                                        }
                                        if (part.containsKey("inlineData")) {
                                            Map<String, Object> inlineData = (Map<String, Object>) part.get("inlineData");
                                            if (inlineData != null && inlineData.containsKey("data") && inlineData.get("data") != null) {
                                                chunkAudio = inlineData.get("data").toString();
                                            }
                                        }
                                    }

                                    if (!chunkText.isEmpty() || chunkAudio != null) {
                                        LLMResponse.LLMResponseBuilder builder = LLMResponse.builder()
                                                .content(chunkText)
                                                .audioData(chunkAudio)
                                                .provider("Gemini")
                                                .model(finalSelectedModel);

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

                                        if (voiceOutput) {
                                            System.out.println("[VOICE] Gemini response chunk: hasText=" + !chunkText.isEmpty() + ", hasAudio=" + (chunkAudio != null));
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
                                        .model(finalSelectedModel);

                                Number promptTokensNum = (Number) usageMetadata.get("promptTokenCount");
                                builder.inputTokens(promptTokensNum != null ? promptTokensNum.intValue() : 0);
                                
                                Number outputTokensNum = (Number) usageMetadata.get("candidatesTokenCount");
                                builder.outputTokens(outputTokensNum != null ? outputTokensNum.intValue() : 0);

                                if (voiceOutput) {
                                    System.out.println("[VOICE] Gemini response chunk: hasText=false, hasAudio=false (metadata only)");
                                }
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
                    if (e instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                        System.err.println("Gemini API Error Body: " + ((org.springframework.web.reactive.function.client.WebClientResponseException) e).getResponseBodyAsString());
                    }
                    System.err.println("SSE Stream error: " + e.getMessage());
                    return Flux.empty();
                });
    }
}