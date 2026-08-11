package com.example.midas_api.dto.produto;

import com.example.midas_api.dto.request.IdentidadeVisualRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AtualizarProdutoRequestDto(

      @Size(max = 100)
      String nome,

      @Size(max = 255)
      String imagem,

      @Positive
      Integer anoFabricacao,

      @Positive
      Integer anoLancamento,

      @Size(max = 1000)
      String resumoDescricao,

      @Size(max = 70)
      String marca,

      @Positive
      Double peso,

      Long categoria,

      Long estadoFisico,

      Long raridade,

      @Valid
      IdentidadeVisualRequestDto identidadeVisualRequestDto
) {}