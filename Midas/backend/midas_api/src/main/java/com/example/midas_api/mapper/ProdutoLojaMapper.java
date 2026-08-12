package com.example.midas_api.mapper;

import com.example.midas_api.dto.produtoLoja.*;
import com.example.midas_api.entity.ProdutoLoja;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProdutoLojaMapper {
    ProdutoLoja toEntity(ProdutoLojaRequest dto);
    ProdutoLojaResponse toResponse(ProdutoLoja entity);
}
