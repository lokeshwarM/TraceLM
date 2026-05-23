package com.tracelm.backend.provider;

public interface LLMProvider {

    String generateResponse(String prompt);

}