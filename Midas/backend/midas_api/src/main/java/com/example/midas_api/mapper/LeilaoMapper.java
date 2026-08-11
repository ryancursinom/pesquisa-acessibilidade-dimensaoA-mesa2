package com.example.midas_api.mapper;

import com.example.midas_api.dto.leilao.AtualizarLeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoResponse;
import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.entity.Leilao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        uses = ProdutoMapper.class,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface LeilaoMapper {

    @Mapping(source = "produtoId", target = "produto.id")
    Leilao toEntity (LeilaoRequest dto);

    LeilaoResponse toResponse (Leilao leilao);

    LeilaoResumoResponse toResponseResumo (Leilao leilao);

    void toUpdate (AtualizarLeilaoRequest dto,
                   @MappingTarget Leilao leilao
    );
}