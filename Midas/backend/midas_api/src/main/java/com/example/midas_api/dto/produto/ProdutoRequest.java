package com.example.midas_api.dto.produto;

import com.example.midas_api.dto.identidadeVisual.IdentidadeVisualRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProdutoRequest(
        @NotBlank @Size(max = 255) String nome,
        @Size(max = 1024) String urlImagem,
        @Positive Integer anoFabricacao,
        @Positive Integer anoLancamento,
        @NotBlank @Size(max = 1000) String resumoDescricao,
        @Size(max = 100) String marca,
        @Positive Double peso,
        @NotNull @PositiveOrZero Double lanceMinimo,
        @NotNull Integer categoriaId,
        @NotNull Integer estadoFisicoId,
        @NotNull Integer raridadeId,
        @Valid IdentidadeVisualRequest identidadeVisual
) {}
