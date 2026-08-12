package com.example.midas_api.service;

import com.example.midas_api.dto.auth.LoginRequest;
import com.example.midas_api.dto.auth.LoginResponse;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.repository.UsuarioRepository;
import com.example.midas_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest dto) {
        Usuario usuario = usuarioRepository.findByUsername(dto.username())
                .orElseThrow(() -> new BusinessException("Usuário ou senha inválidos."));

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new BusinessException("Usuário ou senha inválidos.");
        }

        return new LoginResponse(
                jwtService.gerarToken(usuario.getId(), usuario.getUsername()),
                usuario.getId(),
                usuario.getUsername()
        );
    }
}
