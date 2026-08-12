package com.example.midas_api.security;

import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", username));

        return User.withUsername(usuario.getUsername())
                .password(usuario.getSenha())
                .authorities(AuthorityUtils.NO_AUTHORITIES)
                .build();
    }
}
