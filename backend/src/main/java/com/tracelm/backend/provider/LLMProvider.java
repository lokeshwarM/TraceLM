package com.tracelm.backend.provider;

import com.tracelm.backend.dto.LLMResponse;
import reactor.core.publisher.Flux;

public interface LLMProvider {
    
    LLMResponse generateResponse(String prompt, String model);

    default Flux<LLMResponse> generateStreamResponse(String prompt, String model) {
        throw new UnsupportedOperationException("Streaming not implemented");
    }
}