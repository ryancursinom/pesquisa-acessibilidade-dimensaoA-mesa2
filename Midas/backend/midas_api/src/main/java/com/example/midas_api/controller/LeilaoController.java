package com.example.midas_api.controller;

import com.example.midas_api.dto.leilao.*;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.LeilaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leiloes")
@RequiredArgsConstructor
public class LeilaoController {

    private final LeilaoService leilaoService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<LeilaoResponse> criar(
            @Valid @RequestBody LeilaoRequest dto,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        validarParametro(usuarioId, autenticado);
        LeilaoResponse response = leilaoService.criar(dto, autenticado);
        return ResponseEntity.created(URI.create("/api/v1/leiloes/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LeilaoResponse>> listar(
            @RequestParam(required = false) StatusLeilao status) {
        return ResponseEntity.ok(leilaoService.listar(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeilaoResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(leilaoService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LeilaoResponse> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarLeilaoRequest dto,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        validarParametro(usuarioId, autenticado);
        return ResponseEntity.ok(leilaoService.atualizar(id, dto, autenticado));
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<LeilaoResponse> ativar(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        validarParametro(usuarioId, autenticado);
        return ResponseEntity.ok(leilaoService.ativar(id, autenticado));
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<LeilaoResponse> finalizar(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        validarParametro(usuarioId, autenticado);
        return ResponseEntity.ok(leilaoService.finalizar(id, autenticado));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<LeilaoResponse> cancelar(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        validarParametro(usuarioId, autenticado);
        return ResponseEntity.ok(leilaoService.cancelar(id, autenticado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer usuarioId,
            Authentication authentication) {
        Integer autenticado = currentUserService.get(authentication).getId();
        validarParametro(usuarioId, autenticado);
        leilaoService.deletar(id, autenticado);
        return ResponseEntity.noContent().build();
    }

    private void validarParametro(Integer informado, Integer autenticado) {
        if (informado != null && !informado.equals(autenticado)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "O usuário informado não corresponde ao usuário autenticado.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
    }
}
