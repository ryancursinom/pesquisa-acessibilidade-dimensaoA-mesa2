package com.example.midas_api.dto.telefone;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TelefoneRequest(
        @NotBlank
        String telefone,

        @NotNull
        Integer userId
) {}