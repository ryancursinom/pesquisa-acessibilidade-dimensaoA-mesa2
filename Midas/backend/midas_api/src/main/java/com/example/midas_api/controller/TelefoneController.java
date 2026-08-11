package com.example.midas_api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.midas_api.dto.telefone.AtualizarTelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneResponse;
import com.example.midas_api.service.TelefoneService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/telefones")
@RequiredArgsConstructor
public class TelefoneController {

    private final TelefoneService telefoneService;

    @PostMapping
    public ResponseEntity<TelefoneResponse> criar(@Valid @RequestBody TelefoneRequest dto) {
        TelefoneResponse response = telefoneService.criar(dto);
        return ResponseEntity.created(URI.create("/api/v1/telefones/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TelefoneResponse>> listarPorUsuario(@RequestParam Integer usuarioId) {
        return ResponseEntity.ok(telefoneService.listarPorUsuario(usuarioId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TelefoneResponse> atualizar(
            @PathVariable Integer id, @RequestBody AtualizarTelefoneRequest dto) {
        return ResponseEntity.ok(telefoneService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        telefoneService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}