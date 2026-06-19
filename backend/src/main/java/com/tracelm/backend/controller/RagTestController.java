package com.tracelm.backend.controller;

import com.tracelm.backend.service.RetrievalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import com.tracelm.backend.repository.UserRepository;
import com.tracelm.backend.entity.User;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

import com.tracelm.backend.provider.EmbeddingProvider;
import com.tracelm.backend.repository.DocumentChunkRepository;
import com.tracelm.backend.entity.DocumentChunk;
import java.util.Arrays;

@RestController
@RequiredArgsConstructor
public class RagTestController {

    private final RetrievalService retrievalService;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final EmbeddingProvider embeddingProvider;
    private final DocumentChunkRepository documentChunkRepository;

    @GetMapping("/api/test-rag")
    public Object testRag(@RequestParam(defaultValue = "tell me about GameHok") String q) {
        Map<String, Object> report = new HashMap<>();
        try {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) return Map.of("error", "No users found in database");
            User user = users.get(0);
            
            report.put("1_user_id", user.getId().toString());
            report.put("2_query", q);
            
            Integer totalChunks = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM document_chunks", Integer.class);
            report.put("3_total_chunks", totalChunks);
            
            Integer chunksWithEmbeddings = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM document_chunks WHERE embedding IS NOT NULL", Integer.class);
            report.put("4_chunks_with_embeddings", chunksWithEmbeddings);
            
            RetrievalService.RetrievalResult result = retrievalService.retrieve(q, UUID.randomUUID(), user.getId());
            report.put("5_retrieval_result_final", result);
            
            float[] queryEmbedding = embeddingProvider.generateEmbedding(q);
            String embeddingStr = Arrays.toString(queryEmbedding);
            report.put("6_query_embedding_length", queryEmbedding.length);
            
            try {
                List<DocumentChunk> chunks = documentChunkRepository.findTopRelevantChunks(user.getId(), embeddingStr, 5);
                report.put("7_raw_candidates_returned", chunks.size());
                
                List<Map<String, Object>> candidateDetails = new java.util.ArrayList<>();
                for (DocumentChunk chunk : chunks) {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("chunk_id", chunk.getId().toString());
                    
                    float[] chunkEmbedding = chunk.getEmbedding();
                    double dotProduct = 0.0;
                    double normA = 0.0;
                    double normB = 0.0;
                    for (int i = 0; i < queryEmbedding.length && i < chunkEmbedding.length; i++) {
                        dotProduct += queryEmbedding[i] * chunkEmbedding[i];
                        normA += Math.pow(queryEmbedding[i], 2);
                        normB += Math.pow(chunkEmbedding[i], 2);
                    }
                    double similarity = (normA == 0.0 || normB == 0.0) ? 0.0 : (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)));
                    
                    detail.put("similarity_score", similarity);
                    detail.put("passed_threshold_0_70", similarity >= 0.70);
                    candidateDetails.add(detail);
                }
                report.put("8_candidates_scores", candidateDetails);
                
            } catch(Exception e) {
                report.put("7_raw_candidates_error", e.getMessage());
            }
            
            String promptExample = result.context() + "\n\nAnswer the following question based on the context above: " + q;
            report.put("9_prompt_injected", promptExample);
            
            return report;
        } catch (Exception e) {
            e.printStackTrace();
            report.put("error", e.getMessage() + "\n" + e.toString());
            return report;
        }
    }
}
