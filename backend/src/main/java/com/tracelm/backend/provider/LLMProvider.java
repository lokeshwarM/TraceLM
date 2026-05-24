package com.tracelm.backend.provider;

import com.tracelm.backend.dto.LLMResponse;
import reactor.core.publisher.Flux;

public interface LLMProvider {
    
    LLMResponse generateResponse(String prompt);

    default Flux<String> generateStreamResponse(String prompt) {
        throw new UnsupportedOperationException("Streaming not implemented");
    }
}