package com.example.midas_api.mapper;

import com.example.midas_api.dto.produto.AtualizarProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoResponse;
import com.example.midas_api.dto.produto.ProdutoResumoResponse;
import com.example.midas_api.entity.Produto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        uses = {CategoriaMapper.class, RaridadeMapper.class, EstadoFisicoMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProdutoMapper {

    @Mapping(source = "categoriaId", target = "categoria.id")
    @Mapping(source = "estadoFisicoId", target = "estadoFisico.id")
    @Mapping(source = "raridadeId", target = "raridade.id")
    @Mapping(target = "imagens", ignore = true)
    Produto toEntity(ProdutoRequest dto);

    @Mapping(source = "usuario.id", target = "usuarioId")
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
