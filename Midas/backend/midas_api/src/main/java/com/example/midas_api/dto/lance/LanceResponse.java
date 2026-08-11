package com.example.midas_api.dto.lance;

import com.example.midas_api.dto.leilao.LeilaoResponseDto;
import com.example.midas_api.dto.usuario.UsuarioResponseDto;

import java.time.LocalDateTime;

public record LanceResponseDto(
        Long id,

        double valor,

        LocalDateTime data,

        LeilaoResponseDto leilao,

        UsuarioResponseDto usuario
)
{}