package com.example.midas_api.controller;

import com.example.midas_api.dto.telefone.*;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.TelefoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/telefones")
@RequiredArgsConstructor
public class TelefoneController {

    private final TelefoneService telefoneService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<TelefoneResponse> criar(
            @Valid @RequestBody TelefoneRequest dto,
            Authentication authentication) {
        Integer usuarioId = currentUserService.get(authentication).getId();
        TelefoneResponse response = telefoneService.criar(dto, usuarioId);
        return ResponseEntity.created(URI.create("/api/v1/telefones/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TelefoneResponse>> listarPorUsuario(
            @RequestParam Integer usuarioId,
            Authentication authentication) {
        if (!currentUserService.get(authentication).getId().equals(usuarioId)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "Você só pode consultar os próprios telefones.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(telefoneService.listarPorUsuario(usuarioId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TelefoneResponse> atualizar(
            @PathVariable Integer id,
            @RequestBody AtualizarTelefoneRequest dto,
            Authentication authentication) {
        Integer usuarioId = currentUserService.get(authentication).getId();
        return ResponseEntity.ok(telefoneService.atualizar(id, dto, usuarioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id, Authentication authentication) {
        telefoneService.deletar(id, currentUserService.get(authentication).getId());
        return ResponseEntity.noContent().build();
    }
}
