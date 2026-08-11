package com.example.midas_api.dto.pagamento;

import com.example.midas_api.entity.enums.MeioPagamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PagamentoRequest(
        @NotNull
        MeioPagamento meioPagamento,

        @NotNull
        @Positive
        Double valorTotal,

        @NotNull
        Integer leilaoId,

        // Quem está pagando (o arrematante). Temporário: quando a autenticação
        // existir, isso passa a vir do usuário logado, igual ao ProdutoService.
        @NotNull
        Integer usuarioId
) {}