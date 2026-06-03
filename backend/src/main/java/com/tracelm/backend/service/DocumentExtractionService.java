package com.tracelm.backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class DocumentExtractionService {

    public ExtractionResult extractText(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            int pageCount = document.getNumberOfPages();
            
            return new ExtractionResult(text, pageCount);
        }
    }

    public record ExtractionResult(String text, int pageCount) {
    }
}
