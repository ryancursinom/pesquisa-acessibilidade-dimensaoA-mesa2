package com.example.midas_api.mapper;

import com.example.midas_api.dto.produto.*;
import com.example.midas_api.entity.Produto;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        uses = {CategoriaMapper.class, RaridadeMapper.class, EstadoFisicoMapper.class, IdentidadeVisualMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProdutoMapper {

    @Mapping(source = "categoriaId", target = "categoria.id")
    @Mapping(source = "estadoFisicoId", target = "estadoFisico.id")
    @Mapping(source = "raridadeId", target = "raridade.id")
    @Mapping(target = "imagens", ignore = true)
    Produto toEntity(ProdutoRequest dto);

    @Mapping(source = "imagens", target = "imagens")
    ProdutoResponse toResponse(Produto produto);

    ProdutoResumoResponse toResponseResumo(Produto produto);

    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "estadoFisico", ignore = true)
    @Mapping(target = "raridade", ignore = true)
    @Mapping(target = "imagens", ignore = true)
    void toUpdate(AtualizarProdutoRequest dto, @MappingTarget Produto produto);

    default String map(com.example.midas_api.entity.ProdutoImagem imagem) {
        return imagem == null ? null : imagem.getUrl();
    }
}
