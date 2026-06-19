package com.tracelm.backend.service;

import com.tracelm.backend.entity.DocumentChunk;
import com.tracelm.backend.entity.RetrievalLog;
import com.tracelm.backend.provider.EmbeddingProvider;
import com.tracelm.backend.repository.DocumentChunkRepository;
import com.tracelm.backend.repository.RetrievalLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RetrievalService {

    private final EmbeddingProvider embeddingProvider;
    private final DocumentChunkRepository documentChunkRepository;
    private final RetrievalLogRepository retrievalLogRepository;

    private static final int MAX_RETRIEVED_CHUNKS = 5;

    private static final double MIN_SIMILARITY_THRESHOLD = 0.60;

    public RetrievalResult retrieve(String question, UUID conversationId, UUID userId) {
        float[] queryEmbedding = embeddingProvider.generateEmbedding(question);
        System.out.println("[RAG] Query embedding generated, length: " + queryEmbedding.length);
        
        String embeddingStr = Arrays.toString(queryEmbedding);
        
        List<DocumentChunk> chunks = documentChunkRepository.findTopRelevantChunks(userId, embeddingStr, MAX_RETRIEVED_CHUNKS);
        System.out.println("[RAG] Number of candidate chunks retrieved from DB: " + chunks.size());
        
        if (chunks.isEmpty()) {
            return new RetrievalResult("", List.of());
        }

        StringBuilder contextBuilder = new StringBuilder();
        List<SourceMetadata> sources = new java.util.ArrayList<>();
        
        double bestSimilarity = -1.0;
        
        for (DocumentChunk chunk : chunks) {
            double similarity = computeCosineSimilarity(queryEmbedding, chunk.getEmbedding());
            System.out.println("[RAG] Retrieved chunk ID: " + chunk.getId() + ", Similarity score: " + similarity);
            
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
            }
            
            if (similarity < MIN_SIMILARITY_THRESHOLD) {
                System.out.println("[RAG] Dropping chunk " + chunk.getId() + " due to low confidence (" + similarity + " < " + MIN_SIMILARITY_THRESHOLD + ")");
                continue;
            }
            
            if (sources.isEmpty()) {
                contextBuilder.append("Context from your documents:\n");
            }
            
            contextBuilder.append("[Document: ").append(chunk.getDocument().getFileName())
                          .append(", Page: ").append(chunk.getPageNumber() != null ? chunk.getPageNumber() : "Unknown")
                          .append("]: ")
                          .append(chunk.getContent()).append("\n\n");
            
            sources.add(new SourceMetadata(
                    chunk.getDocument().getFileName(),
                    chunk.getPageNumber() != null ? chunk.getPageNumber() : 0,
                    similarity,
                    chunk.getId(),
                    chunk.getDocument().getId()
            ));
        }

        System.out.println("[RAG] Best similarity score: " + bestSimilarity);

        if (sources.isEmpty()) {
            System.out.println("[RAG] Retrieval skipped due to low relevance");
            return new RetrievalResult("", List.of());
        }

        System.out.println("[RAG] Chunks injected: " + sources.size());
        System.out.println("[RAG] Retrieved document names: " + sources.stream().map(SourceMetadata::documentName).distinct().collect(Collectors.joining(", ")));
        
        RetrievalLog log = RetrievalLog.builder()
                .conversationId(conversationId)
                .userId(userId)
                .query(question)
                .retrievedChunkIds(sources.stream().map(s -> s.chunkId().toString()).collect(Collectors.joining(",")))
                .similarityScores(sources.stream().map(s -> String.valueOf(s.similarityScore())).collect(Collectors.joining(",")))
                .documentIds(sources.stream().map(s -> s.documentId().toString()).collect(Collectors.joining(",")))
                .build();
                
        retrievalLogRepository.save(log);

        return new RetrievalResult(contextBuilder.toString(), sources);
    }

    private double computeCosineSimilarity(float[] vectorA, float[] vectorB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.length && i < vectorB.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    public record RetrievalResult(String context, List<SourceMetadata> sources) {}
    public record SourceMetadata(String documentName, int pageNumber, double similarityScore, UUID chunkId, UUID documentId) {}
}
