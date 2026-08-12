package com.example.midas_api.dto.telefone;

import com.example.midas_api.entity.enums.TipoTelefone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TelefoneRequest(
        @NotBlank String telefone,
        TipoTelefone tipo,
        Boolean principal,
        Integer userId
) {}
