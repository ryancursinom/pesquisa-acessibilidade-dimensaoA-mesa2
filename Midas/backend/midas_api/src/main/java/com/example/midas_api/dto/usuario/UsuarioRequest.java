package com.example.midas_api.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioRequest(
        @NotBlank String nome,
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank String senha
) {}
