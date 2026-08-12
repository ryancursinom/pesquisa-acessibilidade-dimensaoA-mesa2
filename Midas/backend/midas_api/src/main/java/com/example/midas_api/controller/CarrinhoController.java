package com.example.midas_api.controller;

import com.example.midas_api.dto.carrinho.*;
import com.example.midas_api.dto.pedido.PedidoResponse;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.CarrinhoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/carrinho")
@RequiredArgsConstructor
public class CarrinhoController {

    private final CarrinhoService service;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<CarrinhoResponse> buscar(Authentication authentication) {
        return ResponseEntity.ok(service.buscar(currentUserService.get(authentication).getId()));
    }

    @PostMapping("/itens")
    public ResponseEntity<CarrinhoResponse> adicionar(
            @Valid @RequestBody AdicionarCarrinhoItemRequest dto,
            Authentication authentication) {
        return ResponseEntity.ok(service.adicionar(
                currentUserService.get(authentication).getId(), dto));
    }

    @PatchMapping("/itens/{itemId}")
    public ResponseEntity<CarrinhoResponse> atualizar(
            @PathVariable Integer itemId,
            @Valid @RequestBody AtualizarCarrinhoItemRequest dto,
            Authentication authentication) {
        return ResponseEntity.ok(service.atualizarItem(
                currentUserService.get(authentication).getId(), itemId, dto));
    }

    @DeleteMapping("/itens/{itemId}")
    public ResponseEntity<Void> remover(
            @PathVariable Integer itemId, Authentication authentication) {
        service.removerItem(currentUserService.get(authentication).getId(), itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> limpar(Authentication authentication) {
        service.limpar(currentUserService.get(authentication).getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<PedidoResponse> checkout(Authentication authentication) {
        return ResponseEntity.status(201).body(
                service.checkout(currentUserService.get(authentication).getId()));
    }
}
