package com.example.midas_api.mapper;

import com.example.midas_api.dto.leilao.*;
import com.example.midas_api.entity.Leilao;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = ProdutoMapper.class,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LeilaoMapper {

    @Mapping(source = "produtoId", target = "produto.id")
    Leilao toEntity(LeilaoRequest dto);

    LeilaoResponse toResponse(Leilao leilao);

    LeilaoResumoResponse toResponseResumo(Leilao leilao);

    void toUpdate(AtualizarLeilaoRequest dto, @MappingTarget Leilao leilao);
}
