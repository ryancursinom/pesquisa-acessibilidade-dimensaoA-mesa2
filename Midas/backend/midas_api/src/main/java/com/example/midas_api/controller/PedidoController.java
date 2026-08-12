package com.example.midas_api.controller;

import com.example.midas_api.dto.pedido.PedidoResponse;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService service;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar(Authentication authentication) {
        return ResponseEntity.ok(
                service.listarDoUsuario(currentUserService.get(authentication).getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> buscar(
            @PathVariable Integer id, Authentication authentication) {
        return ResponseEntity.ok(
                service.buscar(id, currentUserService.get(authentication).getId()));
    }
}
