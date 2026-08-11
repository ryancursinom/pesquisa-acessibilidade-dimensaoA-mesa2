package com.example.midas_api.dto.usuario;

public record AtualizarSenhaUsuarioRequest(
        String senhaAntiga,
        String senhaNova
) {}