package com.tracelm.backend.provider;

public interface EmbeddingProvider {
    float[] generateEmbedding(String text);
}
