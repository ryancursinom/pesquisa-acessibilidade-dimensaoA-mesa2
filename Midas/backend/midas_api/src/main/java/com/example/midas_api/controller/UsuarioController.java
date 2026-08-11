package com.example.midas_api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.dto.usuario.AtualizarEmailUsuarioRequest;
import com.example.midas_api.dto.usuario.AtualizarSenhaUsuarioRequest;
import com.example.midas_api.dto.usuario.AtualizarUsuarioRequest;
import com.example.midas_api.dto.usuario.UsuarioRequest;
import com.example.midas_api.dto.usuario.UsuarioResponse;
import com.example.midas_api.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody UsuarioRequest dto) {
        UsuarioResponse response = usuarioService.criar(dto);
        return ResponseEntity.created(URI.create("/api/v1/usuarios/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    /** Atualiza dados gerais (nome/username). Email e senha têm rota própria abaixo. */
    @PatchMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizar(
            @PathVariable Integer id, @RequestBody AtualizarUsuarioRequest dto) {
        return ResponseEntity.ok(usuarioService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/email")
    public ResponseEntity<UsuarioResponse> atualizarEmail(
            @PathVariable Integer id, @Valid @RequestBody AtualizarEmailUsuarioRequest dto) {
        return ResponseEntity.ok(usuarioService.atualizarEmail(id, dto));
    }

    @PatchMapping("/{id}/senha")
    public ResponseEntity<Void> atualizarSenha(
            @PathVariable Integer id, @RequestBody AtualizarSenhaUsuarioRequest dto) {
        usuarioService.atualizarSenha(id, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/leiloes")
    public ResponseEntity<List<LeilaoResumoResponse>> listarLeiloes(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.listarLeiloes(id));
    }
}