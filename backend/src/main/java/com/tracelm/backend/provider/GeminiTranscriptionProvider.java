package com.tracelm.backend.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GeminiTranscriptionProvider implements TranscriptionProvider {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.base-url}")
    private String baseUrl;

    @Value("${gemini.default-model}")
    private String defaultModel;

    @SuppressWarnings("unchecked")
    @Override
    public String transcribeAudio(byte[] audioData, String mimeType, String model) {
        WebClient webClient = webClientBuilder.build();
        String selectedModel = (model == null || model.trim().isEmpty()) ? defaultModel : model;
        
        // Use gemini-3.1-flash-lite if the default model is not audio-capable, but usually flash is.
        // For Phase 1 Voice, gemini-3.1-flash-lite is the requested model.
        if (!selectedModel.contains("flash")) {
            selectedModel = "gemini-3.1-flash-lite";
        }

        String base64Audio = Base64.getEncoder().encodeToString(audioData);

        Map<String, Object> inlineData = Map.of(
                "mime_type", mimeType,
                "data", base64Audio
        );

        Map<String, Object> textPart = Map.of(
                "text", "Transcribe the following audio accurately. Return only the exact transcription without any conversational filler."
        );

        Map<String, Object> audioPart = Map.of(
                "inline_data", inlineData
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(textPart, audioPart)
                ))
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
            throw new RuntimeException("Null response from Gemini Audio API");
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            throw new RuntimeException("Gemini Audio API returned empty candidates");
        }

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

        if (parts == null || parts.isEmpty()) {
            return "";
        }

        return parts.get(0).get("text").toString().trim();
    }
}
