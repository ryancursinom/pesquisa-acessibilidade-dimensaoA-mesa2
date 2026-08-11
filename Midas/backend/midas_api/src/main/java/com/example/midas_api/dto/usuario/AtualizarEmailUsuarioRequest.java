package com.example.midas_api.dto.usuario;

import jakarta.validation.constraints.Email;

public record AtualizarEmailUsuarioRequest(

        String senha,

        @Email
        String emailNovo
) {
}