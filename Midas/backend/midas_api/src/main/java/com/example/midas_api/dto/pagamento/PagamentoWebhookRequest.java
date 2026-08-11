package com.example.midas_api.dto.pagamento;

import com.example.midas_api.entity.enums.StatusPagamento;
import jakarta.validation.constraints.NotNull;

/**
 * PLACEHOLDER: o payload real de um webhook de gateway (Mercado Pago, Stripe,
 * etc.) tem um formato próprio e específico de cada provedor — normalmente
 * inclui assinatura/token pra validar que a notificação é legítima, e não
 * manda o status já pronto no formato do nosso enum. Quando vocês escolherem
 * o gateway, esse DTO (e o Controller) precisam ser reescritos pra bater com
 * o formato real. Isso aqui só existe pra fechar o endpoint por enquanto.
 */
public record PagamentoWebhookRequest(
        @NotNull
        Integer pagamentoId,

        @NotNull
        StatusPagamento status
) {}