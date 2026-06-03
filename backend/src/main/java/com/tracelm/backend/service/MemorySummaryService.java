package com.tracelm.backend.service;

import com.tracelm.backend.entity.Message;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemorySummaryService {

    public String generateSummary(List<Message> messages) {
        if (messages == null || messages.isEmpty()) {
            return "Empty conversation.";
        }
        
        StringBuilder summaryBuilder = new StringBuilder();
        int count = 0;
        
        for (Message msg : messages) {
            if ("user".equalsIgnoreCase(msg.getRole())) {
                String content = msg.getContent();
                if (content != null && !content.trim().isEmpty()) {
                    String snippet = content.length() > 100 ? content.substring(0, 100) + "..." : content;
                    summaryBuilder.append("- ").append(snippet.replace('\n', ' ')).append("\n");
                    count++;
                }
            }
            if (count >= 3) {
                break;
            }
        }
        
        if (summaryBuilder.length() == 0) {
            return "No user messages found in this conversation.";
        }
        
        return "Key topics discussed:\n" + summaryBuilder.toString().trim();
    }
}
