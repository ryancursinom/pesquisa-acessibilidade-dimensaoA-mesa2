package com.example.midas_api.dto.pagamento;

import java.time.LocalDateTime;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.dto.usuario.UsuarioResumoResponse;
import com.example.midas_api.entity.enums.MeioPagamento;
import com.example.midas_api.entity.enums.StatusPagamento;

public record PagamentoResponse(
        Integer id,

        MeioPagamento meioPagamento,

        Double valorTotal,

        StatusPagamento status,

        LocalDateTime dataPagamento,

        LocalDateTime criadoEm,

        LeilaoResumoResponse leilao,

        UsuarioResumoResponse usuario
) {}