package com.example.midas_api.mapper;

import com.example.midas_api.dto.pagamento.PagamentoRequest;
import com.example.midas_api.dto.pagamento.PagamentoResponse;
import com.example.midas_api.entity.Pagamento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",
        uses = { LeilaoMapper.class, UsuarioMapper.class }
)
public interface PagamentoMapper {

    @Mapping(source = "leilaoId", target = "leilao.id")
    @Mapping(source = "usuarioId", target = "usuario.id")
    Pagamento toEntity (PagamentoRequest dto);

    PagamentoResponse toResponse (Pagamento pagamento);
}