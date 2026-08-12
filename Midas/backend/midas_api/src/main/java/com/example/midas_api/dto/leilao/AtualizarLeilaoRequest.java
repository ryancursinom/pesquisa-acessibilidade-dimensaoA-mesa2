package com.example.midas_api.dto.leilao;

import com.example.midas_api.entity.enums.TipoCompra;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDateTime;

public record AtualizarLeilaoRequest(
        @FutureOrPresent LocalDateTime dataInicio,
        @Future LocalDateTime dataFim,
        TipoCompra tipoCompra,
        @PositiveOrZero Double valorCompraImediata
) {}
