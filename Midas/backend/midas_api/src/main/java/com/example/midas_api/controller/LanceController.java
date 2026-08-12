package com.example.midas_api.controller;

import com.example.midas_api.dto.lance.*;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.LanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leiloes/{leilaoId}/lances")
@RequiredArgsConstructor
public class LanceController {

    private final LanceService lanceService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<LanceResponse> registrar(
            @PathVariable Integer leilaoId,
            @Valid @RequestBody LanceRequest dto,
            Authentication authentication) {

        Integer usuarioId = currentUserService.get(authentication).getId();
        LanceRequest request = new LanceRequest(dto.valor(), leilaoId, usuarioId);
        LanceResponse response = lanceService.registrar(request);

        return ResponseEntity.created(
                URI.create("/api/v1/leiloes/" + leilaoId + "/lances/" + response.id()))
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<LanceResponse>> listarPorLeilao(@PathVariable Integer leilaoId) {
        return ResponseEntity.ok(lanceService.listarPorLeilao(leilaoId));
    }
}
