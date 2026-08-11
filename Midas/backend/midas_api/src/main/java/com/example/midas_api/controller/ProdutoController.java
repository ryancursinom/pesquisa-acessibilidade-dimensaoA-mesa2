package com.example.midas_api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.midas_api.dto.produto.AtualizarProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoResponse;
import com.example.midas_api.service.ProdutoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    /**
     * usuarioId vem como query param só porque ainda não existe autenticação
     * (Igual ao produtoService). Quando auth entrar, isso
     * deixa de ser @RequestParam e passa a vir do usuário logado.
     */
    @PostMapping
    public ResponseEntity<ProdutoResponse> criar(
            @Valid @RequestBody ProdutoRequest dto, @RequestParam Integer usuarioId) {
        ProdutoResponse response = produtoService.criar(dto, usuarioId);
        return ResponseEntity.created(URI.create("/api/v1/produtos/" + response.id())).body(response);
    }

    /** Sem usuarioId: lista os produtos DISPONIVEIS. Com usuarioId: lista os produtos daquele usuário. */
    @GetMapping
    public ResponseEntity<List<ProdutoResponse>> listar(
            @RequestParam(required = false) Integer usuarioId) {
        List<ProdutoResponse> produtos = usuarioId != null
                ? produtoService.listarPorUsuario(usuarioId)
                : produtoService.listarDisponiveis();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProdutoResponse> atualizar(
            @PathVariable Integer id,
            @RequestBody AtualizarProdutoRequest dto,
            @RequestParam Integer usuarioId) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto, usuarioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id, @RequestParam Integer usuarioId) {
        produtoService.deletar(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}