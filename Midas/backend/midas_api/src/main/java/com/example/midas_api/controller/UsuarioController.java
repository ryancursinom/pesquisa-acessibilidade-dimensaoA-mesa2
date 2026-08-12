package com.example.midas_api.controller;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.dto.usuario.*;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody UsuarioRequest dto) {
        UsuarioResponse response = usuarioService.criar(dto);
        return ResponseEntity.created(URI.create("/api/v1/usuarios/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable Integer id,
            @RequestBody AtualizarUsuarioRequest dto,
            Authentication authentication) {
        validarProprioUsuario(id, authentication);
        return ResponseEntity.ok(usuarioService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/email")
    public ResponseEntity<UsuarioResponse> atualizarEmail(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarEmailUsuarioRequest dto,
            Authentication authentication) {
        validarProprioUsuario(id, authentication);
        return ResponseEntity.ok(usuarioService.atualizarEmail(id, dto));
    }

    @PatchMapping("/{id}/senha")
    public ResponseEntity<Void> atualizarSenha(
            @PathVariable Integer id,
            @RequestBody AtualizarSenhaUsuarioRequest dto,
            Authentication authentication) {
        validarProprioUsuario(id, authentication);
        usuarioService.atualizarSenha(id, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id, Authentication authentication) {
        validarProprioUsuario(id, authentication);
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/leiloes")
    public ResponseEntity<List<LeilaoResumoResponse>> listarLeiloes(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.listarLeiloes(id));
    }

    private void validarProprioUsuario(Integer id, Authentication authentication) {
        if (!currentUserService.get(authentication).getId().equals(id)) {
            throw new com.example.midas_api.exception.BusinessException(
                    "Você só pode alterar a própria conta.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
    }
}
