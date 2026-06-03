package com.tracelm.backend.controller;

import com.tracelm.backend.dto.DocumentDto;
import com.tracelm.backend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentDto uploadDocument(@RequestParam("file") MultipartFile file, Principal principal) {
        return documentService.uploadDocument(file, principal.getName());
    }

    @GetMapping
    public List<DocumentDto> getAllDocuments(Principal principal) {
        return documentService.getAllDocuments(principal.getName());
    }

    @GetMapping("/{id}")
    public DocumentDto getDocument(@PathVariable UUID id, Principal principal) {
        return documentService.getDocument(id, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(@PathVariable UUID id, Principal principal) {
        documentService.deleteDocument(id, principal.getName());
    }
}
