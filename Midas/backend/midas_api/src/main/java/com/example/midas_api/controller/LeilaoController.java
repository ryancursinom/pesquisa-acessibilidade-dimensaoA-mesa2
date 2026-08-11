package com.example.midas_api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.midas_api.dto.leilao.AtualizarLeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoResponse;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.service.LeilaoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/leiloes")
@RequiredArgsConstructor
public class LeilaoController {

    private final LeilaoService leilaoService;

    @PostMapping
    public ResponseEntity<LeilaoResponse> criar(
            @Valid @RequestBody LeilaoRequest dto,
            @RequestParam Integer usuarioId) {

        LeilaoResponse response =
                leilaoService.criar(dto, usuarioId);

        return ResponseEntity.created(URI.create(
                                "/api/v1/leiloes/" + response.id())
                ).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LeilaoResponse>> listar(
            @RequestParam(required = false) StatusLeilao status) {

        return ResponseEntity.ok(
                leilaoService.listar(status)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeilaoResponse> buscarPorId(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                leilaoService.buscarPorId(id)
        );
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LeilaoResponse> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody AtualizarLeilaoRequest dto,
            @RequestParam Integer usuarioId) {

        return ResponseEntity.ok(
                leilaoService.atualizar(id, dto, usuarioId)
        );
    }

    @PatchMapping("/{id}/ativar")
    public ResponseEntity<LeilaoResponse> ativar(
            @PathVariable Integer id,
            @RequestParam Integer usuarioId) {

        return ResponseEntity.ok(
                leilaoService.ativar(id, usuarioId)
        );
    }

    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<LeilaoResponse> finalizar(
            @PathVariable Integer id,
            @RequestParam Integer usuarioId) {

        return ResponseEntity.ok(
                leilaoService.finalizar(id, usuarioId)
        );
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<LeilaoResponse> cancelar(
            @PathVariable Integer id,
            @RequestParam Integer usuarioId) {

        return ResponseEntity.ok(
                leilaoService.cancelar(id, usuarioId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Integer id,
            @RequestParam Integer usuarioId) {

        leilaoService.deletar(id, usuarioId);

        return ResponseEntity.noContent().build();
    }
}