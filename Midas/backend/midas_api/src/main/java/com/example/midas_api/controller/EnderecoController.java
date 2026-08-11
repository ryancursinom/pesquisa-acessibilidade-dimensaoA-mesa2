package com.example.midas_api.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.midas_api.dto.endereco.AtualizarEnderecoRequest;
import com.example.midas_api.dto.endereco.EnderecoRequest;
import com.example.midas_api.dto.endereco.EnderecoResponse;
import com.example.midas_api.service.EnderecoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    @PostMapping
    public ResponseEntity<EnderecoResponse> criar(@Valid @RequestBody EnderecoRequest dto) {
        EnderecoResponse response = enderecoService.criar(dto);
        return ResponseEntity.created(URI.create("/api/v1/enderecos/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnderecoResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(enderecoService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EnderecoResponse> atualizar(
            @PathVariable Integer id, @RequestBody AtualizarEnderecoRequest dto) {
        return ResponseEntity.ok(enderecoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        enderecoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}