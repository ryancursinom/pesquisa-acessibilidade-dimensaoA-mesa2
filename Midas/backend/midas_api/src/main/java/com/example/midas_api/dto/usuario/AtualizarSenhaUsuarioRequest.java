package com.example.midas_api.dto.usuario;

public record AtualizarSenhaUsuarioRequestDto(
        String senhaAntiga,
        String senhaNova
) {}