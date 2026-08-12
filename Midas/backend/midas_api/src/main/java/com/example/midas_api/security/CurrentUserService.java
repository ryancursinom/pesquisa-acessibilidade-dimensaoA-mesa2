package com.example.midas_api.security;

import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UsuarioRepository usuarioRepository;

    public Usuario get(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Usuário não autenticado.", HttpStatus.UNAUTHORIZED);
        }

        return usuarioRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new BusinessException(
                        "Usuário autenticado não encontrado.", HttpStatus.UNAUTHORIZED));
    }
}
