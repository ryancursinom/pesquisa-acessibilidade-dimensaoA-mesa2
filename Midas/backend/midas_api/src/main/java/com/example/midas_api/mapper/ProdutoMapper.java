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
        uses = {CategoriaMapper.class, RaridadeMapper.class, EstadoFisicoMapper.class, IdentidadeVisualMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ProdutoMapper {

    @Mapping(source = "categoriaId", target = "categoria.id")
    @Mapping(source = "estadoFisicoId", target = "estadoFisico.id")
    @Mapping(source = "raridadeId", target = "raridade.id")
    @Mapping(source = "identidadeVisual", target = "identidadeVisual")
    Produto toEntity (ProdutoRequest dto);

    ProdutoResponse toResponse (Produto produto);

    ProdutoResumoResponse toResponseResumo (Produto produto);

    // Os campos categoria/estadoFisico/raridade são ignorados aqui de propósito:
    // trocar a associação por ID deve ser feito no Service (buscando a nova entidade
    // no repositório), nunca sobrescrevendo o "id" do objeto já associado via MapStruct.
    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "estadoFisico", ignore = true)
    @Mapping(target = "raridade", ignore = true)
    void toUpdate (AtualizarProdutoRequest dto, @MappingTarget Produto produto);
}