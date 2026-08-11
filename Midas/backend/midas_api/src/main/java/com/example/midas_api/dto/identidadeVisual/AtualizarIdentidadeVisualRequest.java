package com.example.midas_api.dto.identidadeVisual;

import jakarta.validation.constraints.NotBlank;

public record AtualizarIdentidadeVisualRequest(
        String corPrimaria,

        String corSecundaria,

        String descricaoPaleta,

        String formato,

        String descricaoFormato
) {}