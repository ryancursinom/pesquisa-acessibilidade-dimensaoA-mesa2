package com.example.midas_api.dto.endereco;

public record EnderecoResponse(
        Integer id,

        String cep,

        String logradouro,

        String bairro,

        String cidade,

        Integer numero,

        String estado,

        String pais,

        String complemento
){}
