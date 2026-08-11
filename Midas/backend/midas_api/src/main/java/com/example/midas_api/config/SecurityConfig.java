package com.example.midas_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Só o encoder de senha (BCrypt). Isso NÃO configura autenticação, login,
 * filtros de segurança nem nada do tipo — é só a ferramenta usada pelo
 * UsuarioService pra nunca gravar senha em texto puro na coluna
 * "senha_hash". Quando vocês implementarem auth de verdade (login, JWT),
 * esse mesmo bean será reaproveitado pra validar a senha no login.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}