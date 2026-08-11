package com.example.midas_api.dto.leilao;

import java.time.LocalDateTime;

import com.example.midas_api.entity.enums.StatusLeilao;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;

public record AtualizarLeilaoRequest(
        @FutureOrPresent
        LocalDateTime dataInicio,

        @Future
        LocalDateTime dataFim
) {}