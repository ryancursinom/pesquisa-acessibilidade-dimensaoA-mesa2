package com.example.midas_api.mapper;

import com.example.midas_api.dto.telefone.*;
import com.example.midas_api.entity.Telefone;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TelefoneMapper {

    Telefone toEntity(TelefoneRequest dto);

    TelefoneResponse toResponse(Telefone telefone);

    void toUpdate(AtualizarTelefoneRequest dto, @MappingTarget Telefone telefone);
}
