package com.example.midas_api.security;

import com.example.midas_api.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

public final class SecurityUserUtil {

    private SecurityUserUtil() {}

    public static Integer getUsuarioId(Authentication authentication, JwtService jwtService) {
        if (authentication == null || authentication.getCredentials() == null) {
            throw new BusinessException("Usuário não autenticado.", HttpStatus.UNAUTHORIZED);
        }
        return jwtService.extrairUsuarioId(authentication.getCredentials().toString());
    }
}
