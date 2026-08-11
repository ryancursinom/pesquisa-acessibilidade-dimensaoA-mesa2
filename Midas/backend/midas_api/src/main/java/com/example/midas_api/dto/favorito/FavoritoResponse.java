package com.example.midas_api.dto.favorito;

import java.time.LocalDateTime;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;

public record FavoritoResponse(
        LeilaoResumoResponse leilao,
        LocalDateTime dataAdicao
) {}