package com.example.midas_api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.midas_api.dto.favorito.FavoritoRequest;
import com.example.midas_api.dto.favorito.FavoritoResponse;
import com.example.midas_api.service.FavoritoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usuarios/{usuarioId}/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;

    @GetMapping
    public ResponseEntity<List<FavoritoResponse>> listar(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(favoritoService.listar(usuarioId));
    }

    @PostMapping
    public ResponseEntity<FavoritoResponse> adicionar(
            @PathVariable Integer usuarioId, @Valid @RequestBody FavoritoRequest dto) {
        FavoritoResponse response = favoritoService.adicionar(usuarioId, dto);
        return ResponseEntity.status(201).body(response);
    }

    @DeleteMapping("/{leilaoId}")
    public ResponseEntity<Void> remover(
            @PathVariable Integer usuarioId, @PathVariable Integer leilaoId) {
        favoritoService.remover(usuarioId, leilaoId);
        return ResponseEntity.noContent().build();
    }
}