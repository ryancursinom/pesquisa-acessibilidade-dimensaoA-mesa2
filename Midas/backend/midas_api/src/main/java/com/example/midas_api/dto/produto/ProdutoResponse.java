package com.example.midas_api.dto.produto;

import com.example.midas_api.dto.categoria.CategoriaResponse;
import com.example.midas_api.dto.estadoFisico.EstadoFisicoResponse;
import com.example.midas_api.dto.identidadeVisual.IdentidadeVisualResponse;
import com.example.midas_api.dto.raridade.RaridadeResponse;
import com.example.midas_api.entity.enums.StatusProduto;
import java.time.LocalDateTime;
import java.util.List;

public record ProdutoResponse(
        Integer id,
        String nome,
        String urlImagem,
        Integer anoFabricacao,
        Integer anoLancamento,
        String resumoDescricao,
        String marca,
        Double peso,
        Double lanceMinimo,
        StatusProduto status,
        LocalDateTime criadoEm,
        CategoriaResponse categoria,
        EstadoFisicoResponse estadoFisico,
        RaridadeResponse raridade,
        IdentidadeVisualResponse identidadeVisual,
        List<String> imagens
) {}
