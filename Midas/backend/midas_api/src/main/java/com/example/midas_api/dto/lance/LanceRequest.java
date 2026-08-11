package com.example.midas_api.dto.lance;

import jakarta.validation.constraints.NotNull;

public record LanceRequestDto(
        @NotNull
        double valor,

        @NotNull
        Long leilaoId,

        @NotNull
        Long usuarioId
) {}