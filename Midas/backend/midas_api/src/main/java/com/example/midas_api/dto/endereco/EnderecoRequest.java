package com.example.midas_api.dto.endereco;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnderecoRequest(
        @NotBlank
        String cep,

        @NotBlank
        String logradouro,

        @NotBlank
        String bairro,

        @NotBlank
        String cidade,

        @NotBlank
        @Size(min = 2, max = 2, message = "estado deve ser a sigla da UF (2 letras)")
        String estado,

        @NotBlank
        String pais,

        Integer numero,

        String complemento
)
{}
