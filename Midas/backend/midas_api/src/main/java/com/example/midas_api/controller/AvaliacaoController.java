package com.example.midas_api.controller;

import com.example.midas_api.dto.avaliacao.*;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService service;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<AvaliacaoResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponse> criar(
            @Valid @RequestBody AvaliacaoRequest dto,
            Authentication authentication) {
        return ResponseEntity.status(201).body(
                service.criar(currentUserService.get(authentication).getId(), dto));
    }
}
