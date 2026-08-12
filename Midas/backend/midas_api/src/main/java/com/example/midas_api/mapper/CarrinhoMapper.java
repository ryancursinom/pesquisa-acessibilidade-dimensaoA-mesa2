package com.example.midas_api.mapper;

import com.example.midas_api.dto.carrinho.*;
import com.example.midas_api.entity.Carrinho;
import com.example.midas_api.entity.CarrinhoItem;
import com.example.midas_api.dto.produtoLoja.ProdutoLojaResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CarrinhoMapper {

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(target = "itens", ignore = true)
    CarrinhoResponse toResponse(Carrinho carrinho);

    @Mapping(source = "produtoLoja", target = "produto")
    @Mapping(target = "subtotal", ignore = true)
    CarrinhoItemResponse toItemResponse(CarrinhoItem item);

    ProdutoLojaResponse toProdutoResponse(com.example.midas_api.entity.ProdutoLoja produto);
}
