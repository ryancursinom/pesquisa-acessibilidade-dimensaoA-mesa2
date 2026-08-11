package com.example.midas_api.dto.leilao;

import java.time.LocalDateTime;

import com.example.midas_api.dto.produto.ProdutoResumoResponse;
import com.example.midas_api.entity.enums.StatusLeilao;

public record LeilaoResponse(
        Integer id,

        LocalDateTime dataInicio,

        LocalDateTime dataFim,

        StatusLeilao status,

        LocalDateTime criadoEm,

        ProdutoResumoResponse produto
) {}
