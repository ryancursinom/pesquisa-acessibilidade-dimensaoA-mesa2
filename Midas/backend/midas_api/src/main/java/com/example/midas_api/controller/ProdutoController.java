package com.example.midas_api.controller;

import com.example.midas_api.dto.produto.*;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<ProdutoResponse> criar(
            @Valid @RequestBody ProdutoRequest dto,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        if (usuarioId != null && !usuarioId.equals(autenticado)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "O usuário informado não corresponde ao usuário autenticado.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
        ProdutoResponse response = produtoService.criar(dto, autenticado);
        return ResponseEntity.created(URI.create("/api/v1/produtos/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponse>> listar(@RequestParam(required = false) Integer usuarioId) {
        return ResponseEntity.ok(usuarioId == null
                ? produtoService.listarDisponiveis()
                : produtoService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProdutoResponse> atualizar(
            @PathVariable Integer id,
            @RequestBody AtualizarProdutoRequest dto,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        if (usuarioId != null && !usuarioId.equals(autenticado)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "O usuário informado não corresponde ao usuário autenticado.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(produtoService.atualizar(id, dto, autenticado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        if (usuarioId != null && !usuarioId.equals(autenticado)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "O usuário informado não corresponde ao usuário autenticado.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
        produtoService.deletar(id, autenticado);
        return ResponseEntity.noContent().build();
    }
}
