package com.example.midas_api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.midas_api.dto.lance.LanceRequest;
import com.example.midas_api.dto.lance.LanceResponse;
import com.example.midas_api.service.LanceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/leiloes/{leilaoId}/lances")
@RequiredArgsConstructor
public class LanceController {

    private final LanceService lanceService;

    /**
     * Usar o leilaoId da URL para reconstruir o LanceRequest
     * com ele, ignorando qualquer leilaoId que porventura venha no corpo,
     * pra não correr o risco de body e URL apontarem pra leilões diferentes.
     */
    @PostMapping
    public ResponseEntity<LanceResponse> registrar(
            @PathVariable Integer leilaoId, @Valid @RequestBody LanceRequest dto) {
        LanceRequest dtoComLeilaoDaUrl = new LanceRequest(dto.valor(), leilaoId, dto.usuarioId());
        LanceResponse response = lanceService.registrar(dtoComLeilaoDaUrl);
        return ResponseEntity.created(URI.create("/api/v1/leiloes/" + leilaoId + "/lances")).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LanceResponse>> listarPorLeilao(@PathVariable Integer leilaoId) {
        return ResponseEntity.ok(lanceService.listarPorLeilao(leilaoId));
    }
}