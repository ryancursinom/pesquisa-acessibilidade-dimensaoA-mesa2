package com.example.midas_api.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.midas_api.dto.pagamento.PagamentoRequest;
import com.example.midas_api.dto.pagamento.PagamentoResponse;
import com.example.midas_api.dto.pagamento.PagamentoWebhookRequest;
import com.example.midas_api.service.PagamentoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;

    @PostMapping
    public ResponseEntity<PagamentoResponse> iniciar(@Valid @RequestBody PagamentoRequest dto) {
        PagamentoResponse response = pagamentoService.iniciar(dto);
        return ResponseEntity.created(URI.create("/api/v1/pagamentos/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagamentoResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(pagamentoService.buscarPorId(id));
    }

    /**
     * PLACEHOLDER — ver aviso em PagamentoWebhookRequest. O formato real e a
     * validação de assinatura do gateway (Mercado Pago/Stripe) precisam ser
     * implementados quando o gateway for escolhido.
     */
    @PostMapping("/webhook")
    public ResponseEntity<PagamentoResponse> webhook(@Valid @RequestBody PagamentoWebhookRequest dto) {
        return ResponseEntity.ok(pagamentoService.atualizarStatus(dto.pagamentoId(), dto.status()));
    }
}