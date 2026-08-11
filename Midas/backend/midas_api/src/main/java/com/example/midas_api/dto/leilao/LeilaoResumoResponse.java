package com.example.midas_api.dto.leilao;

import com.example.midas_api.entity.enums.StatusLeilao;

public record LeilaoResumoResponse(
        Integer id,
        StatusLeilao status
) {
}