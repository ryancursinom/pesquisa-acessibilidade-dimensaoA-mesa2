package com.example.midas_api.dto.produto;

import com.example.midas_api.entity.enums.StatusProduto;

public record ProdutoResumoResponseDto(
        Long id,

        String nome,

        String urlImagem,

        StatusProduto status
) {}