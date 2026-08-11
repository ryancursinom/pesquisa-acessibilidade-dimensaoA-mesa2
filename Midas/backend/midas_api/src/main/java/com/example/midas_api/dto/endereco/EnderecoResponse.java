package com.example.midas_api.dto.response;

public record EnderecoResponse(
        Long id,

        String cep,

        String logradouro,

        String bairro,

        String cidade,

        String numero,

        String estado,

        String pais,

        String complemento
){}