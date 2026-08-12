package com.example.midas_api.dto.auth;

public record LoginResponse(
        String token,
        Integer usuarioId,
        String username
) {}
