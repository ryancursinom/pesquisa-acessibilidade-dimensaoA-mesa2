package com.example.midas_api.dto.produto;

import com.example.midas_api.dto.request.IdentidadeVisualRequestDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProdutoRequestDto(
        @NotBlank
        @Size (max = 100)
        String nome,

        @NotBlank
        @Size(max = 255)
        String urlImagem,

        @Positive
        Integer anoFabricacao,

        @Positive
        Integer anoLancamento,

        @NotBlank
        @Size(max = 1000)
        String resumoDescricao,

        @Size(max = 70)
        String marca,

        @Positive
        Double peso,

        @NotNull
        Long categoria,

        @NotNull
        Long estadoFisico,

        @NotNull
        Long raridade,

        @NotNull
        IdentidadeVisualRequestDto identidadeVisualRequestDto
)
{}