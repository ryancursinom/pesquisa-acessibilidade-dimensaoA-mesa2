package com.example.midas_api.mapper;

import com.example.midas_api.dto.usuario.*;
import com.example.midas_api.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UsuarioMapper {

    @Mapping(source = "enderecoId", target = "endereco.id")
    Usuario toEntity (UsuarioRequest dto);

    UsuarioResponse toResponse (Usuario usuario);

    UsuarioResumoResponse toResponseResumo (Usuario usuario);

    void toUpdate (AtualizarUsuarioRequest dto,
                   @MappingTarget Usuario usuario
    );
}