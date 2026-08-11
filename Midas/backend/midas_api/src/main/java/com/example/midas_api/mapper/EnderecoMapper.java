package com.example.midas_api.mapper;

import com.example.midas_api.dto.endereco.AtualizarEnderecoRequest;
import com.example.midas_api.dto.endereco.EnderecoRequest;
import com.example.midas_api.dto.endereco.EnderecoResponse;
import com.example.midas_api.entity.Endereco;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EnderecoMapper {

    Endereco toEntity (EnderecoRequest dto);

    EnderecoResponse toResponse (Endereco endereco);

    void toUpdate (AtualizarEnderecoRequest dto, @MappingTarget Endereco endereco);
}