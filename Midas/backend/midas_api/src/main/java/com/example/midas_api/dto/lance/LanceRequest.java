package com.example.midas_api.dto.lance;

import jakarta.validation.constraints.NotNull;

public record LanceRequest(
        @NotNull
        double valor,

        @NotNull
        Integer leilaoId,

        @NotNull
        Integer usuarioId
) {}