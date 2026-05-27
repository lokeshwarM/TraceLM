package com.tracelm.backend.provider;

import com.tracelm.backend.dto.LLMResponse;
import reactor.core.publisher.Flux;

import com.tracelm.backend.entity.Message;
import java.util.List;

public interface LLMProvider {
    
    LLMResponse generateResponse(List<Message> messages, String model);

    default Flux<LLMResponse> generateStreamResponse(List<Message> messages, String model) {
        throw new UnsupportedOperationException("Streaming not implemented");
    }
}