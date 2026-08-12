package com.example.midas_api.dto.pedido;

import com.example.midas_api.entity.enums.StatusPedido;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Integer id,
        Integer usuarioId,
        StatusPedido status,
        Double valorTotal,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        List<PedidoItemResponse> itens
) {}
