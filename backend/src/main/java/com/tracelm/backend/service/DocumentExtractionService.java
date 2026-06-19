package com.tracelm.backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentExtractionService {

    public ExtractionResult extractText(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            int pageCount = document.getNumberOfPages();
            
            // Extract the whole text for legacy support (if needed)
            PDFTextStripper wholeStripper = new PDFTextStripper();
            String fullText = wholeStripper.getText(document);
            
            // Extract page by page
            List<PageText> pages = new ArrayList<>();
            for (int i = 1; i <= pageCount; i++) {
                PDFTextStripper pageStripper = new PDFTextStripper();
                pageStripper.setStartPage(i);
                pageStripper.setEndPage(i);
                String pageContent = pageStripper.getText(document);
                if (pageContent != null && !pageContent.trim().isEmpty()) {
                    pages.add(new PageText(i, pageContent.trim()));
                }
            }

            return new ExtractionResult(fullText, pageCount, pages);
        }
    }

    public record PageText(int pageNumber, String text) {}
    
    public record ExtractionResult(String text, int pageCount, List<PageText> pages) {
    }
}
