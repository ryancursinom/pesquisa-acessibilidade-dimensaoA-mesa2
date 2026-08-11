package com.example.midas_api.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequest(

        @NotBlank
        String nome,

        @NotBlank
        String username,

        @NotBlank
        @Email
        String email,

        @NotBlank
        String senha,

        @NotNull
        Integer enderecoId
)
{}