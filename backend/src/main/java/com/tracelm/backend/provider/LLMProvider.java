package com.tracelm.backend.provider;

import com.tracelm.backend.dto.LLMResponse;

public interface LLMProvider {
    
    LLMResponse generateResponse(String prompt);

}