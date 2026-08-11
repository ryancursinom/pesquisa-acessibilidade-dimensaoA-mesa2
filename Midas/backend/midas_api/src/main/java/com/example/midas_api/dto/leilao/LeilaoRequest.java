package com.example.midas_api.dto.leilao;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;


public record LeilaoRequest(
        @FutureOrPresent
        @NotNull
        LocalDateTime dataInicio,

        @Future
        @NotNull
        LocalDateTime dataFim,

        @NotNull
        Integer produtoId
)
{}