package com.tracelm.backend.controller;

import com.tracelm.backend.dto.MemoryDto;
import com.tracelm.backend.dto.MemoryRequest;
import com.tracelm.backend.service.MemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/memories")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryService memoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MemoryDto createMemory(@RequestBody MemoryRequest request, Principal principal) {
        return memoryService.createMemory(request, principal.getName());
    }

    @GetMapping
    public List<MemoryDto> getAllMemories(Principal principal) {
        return memoryService.getAllMemories(principal.getName());
    }

    @GetMapping("/{id}")
    public MemoryDto getMemory(@PathVariable UUID id, Principal principal) {
        return memoryService.getMemory(id, principal.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMemory(@PathVariable UUID id, Principal principal) {
        memoryService.deleteMemory(id, principal.getName());
    }
}
