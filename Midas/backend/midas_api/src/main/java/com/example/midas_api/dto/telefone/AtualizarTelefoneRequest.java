package com.example.midas_api.dto.telefone;

import com.example.midas_api.entity.enums.TipoTelefone;

public record AtualizarTelefoneRequest(
        String telefone,
        TipoTelefone tipo,
        Boolean principal
) {}
