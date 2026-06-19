package com.tracelm.backend.service;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DocumentChunker {

    private static final int MAX_CHUNK_SIZE = 1000;

    public List<ChunkResult> chunkDocument(List<DocumentExtractionService.PageText> pages) {
        List<ChunkResult> results = new ArrayList<>();
        int chunkIndex = 0;

        for (DocumentExtractionService.PageText page : pages) {
            String content = page.text();
            if (content.length() <= MAX_CHUNK_SIZE) {
                results.add(new ChunkResult(chunkIndex++, page.pageNumber(), content));
            } else {
                // Split by sentence to avoid cutting words
                String[] parts = content.split("(?<=\\.)\\s+"); 
                StringBuilder currentChunk = new StringBuilder();
                
                for (String part : parts) {
                    if (currentChunk.length() + part.length() > MAX_CHUNK_SIZE && currentChunk.length() > 0) {
                        results.add(new ChunkResult(chunkIndex++, page.pageNumber(), currentChunk.toString().trim()));
                        currentChunk = new StringBuilder();
                    }
                    currentChunk.append(part).append(" ");
                }
                if (currentChunk.length() > 0) {
                    results.add(new ChunkResult(chunkIndex++, page.pageNumber(), currentChunk.toString().trim()));
                }
            }
        }
        return results;
    }

    public record ChunkResult(int chunkIndex, int pageNumber, String content) {}
}
