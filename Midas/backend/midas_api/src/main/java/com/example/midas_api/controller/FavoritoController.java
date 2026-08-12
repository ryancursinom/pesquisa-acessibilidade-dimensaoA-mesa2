package com.example.midas_api.controller;

import com.example.midas_api.dto.favorito.*;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.FavoritoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios/{usuarioId}/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<FavoritoResponse>> listar(
            @PathVariable Integer usuarioId, Authentication authentication) {
        validar(usuarioId, authentication);
        return ResponseEntity.ok(favoritoService.listar(usuarioId));
    }

    @PostMapping
    public ResponseEntity<FavoritoResponse> adicionar(
            @PathVariable Integer usuarioId,
            @Valid @RequestBody FavoritoRequest dto,
            Authentication authentication) {
        validar(usuarioId, authentication);
        return ResponseEntity.status(201).body(favoritoService.adicionar(usuarioId, dto));
    }

    @DeleteMapping("/{leilaoId}")
    public ResponseEntity<Void> remover(
            @PathVariable Integer usuarioId,
            @PathVariable Integer leilaoId,
            Authentication authentication) {
        validar(usuarioId, authentication);
        favoritoService.remover(usuarioId, leilaoId);
        return ResponseEntity.noContent().build();
    }

    private void validar(Integer usuarioId, Authentication authentication) {
        if (!currentUserService.get(authentication).getId().equals(usuarioId)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "Você só pode manipular os próprios favoritos.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
    }
}
