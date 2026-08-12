package com.example.midas_api.controller;

import com.example.midas_api.dto.pagamento.*;
import com.example.midas_api.security.CurrentUserService;
import com.example.midas_api.service.PagamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<PagamentoResponse> iniciar(
            @Valid @RequestBody PagamentoRequest dto,
            Authentication authentication) {
        Integer usuarioId = currentUserService.get(authentication).getId();
        PagamentoResponse response = pagamentoService.iniciar(dto, usuarioId);
        return ResponseEntity.created(URI.create("/api/v1/pagamentos/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagamentoResponse> buscarPorId(
            @PathVariable Integer id, Authentication authentication) {
        return ResponseEntity.ok(
                pagamentoService.buscarPorId(id, currentUserService.get(authentication).getId()));
    }

    /**
     * O webhook real deve ser liberado apenas para o gateway e protegido por
     * assinatura. Este endpoint mantém o contrato provisório já existente.
     */
    @PostMapping("/webhook")
    public ResponseEntity<PagamentoResponse> webhook(
            @Valid @RequestBody PagamentoWebhookRequest dto) {
        return ResponseEntity.ok(
                pagamentoService.atualizarStatus(
                        dto.pagamentoId(), dto.status(), dto.idTransacao(), dto.txidPix()));
    }
}
