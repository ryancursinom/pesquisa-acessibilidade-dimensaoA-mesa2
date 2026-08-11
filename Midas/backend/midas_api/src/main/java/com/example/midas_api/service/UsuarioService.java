package com.example.midas_api.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.midas_api.dto.leilao.LeilaoResumoResponse;
import com.example.midas_api.dto.usuario.AtualizarEmailUsuarioRequest;
import com.example.midas_api.dto.usuario.AtualizarSenhaUsuarioRequest;
import com.example.midas_api.dto.usuario.AtualizarUsuarioRequest;
import com.example.midas_api.dto.usuario.UsuarioRequest;
import com.example.midas_api.dto.usuario.UsuarioResponse;
import com.example.midas_api.entity.Endereco;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.LeilaoMapper;
import com.example.midas_api.mapper.UsuarioMapper;
import com.example.midas_api.repository.EnderecoRepository;
import com.example.midas_api.repository.LeilaoRepository;
import com.example.midas_api.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EnderecoRepository enderecoRepository;
    private final LeilaoRepository leilaoRepository;
    private final UsuarioMapper usuarioMapper;
    private final LeilaoMapper leilaoMapper;
    private final PasswordEncoder passwordEncoder;

    public UsuarioResponse criar(UsuarioRequest dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new ResourceAlreadyExistsException("Usuário", "email", dto.email());
        }
        if (usuarioRepository.existsByUsername(dto.username())) {
            throw new ResourceAlreadyExistsException("Usuário", "username", dto.username());
        }

        Endereco endereco = enderecoRepository.findById(dto.enderecoId())
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", dto.enderecoId()));

        Usuario usuario = usuarioMapper.toEntity(dto);
        usuario.setEndereco(endereco);
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Integer id) {
        return usuarioMapper.toResponse(buscarEntidadePorId(id));
    }

    public UsuarioResponse atualizar(Integer id, AtualizarUsuarioRequest dto) {
        Usuario usuario = buscarEntidadePorId(id);

        if (dto.username() != null && !dto.username().equals(usuario.getUsername())
                && usuarioRepository.existsByUsername(dto.username())) {
            throw new ResourceAlreadyExistsException("Usuário", "username", dto.username());
        }

        usuarioMapper.toUpdate(dto, usuario);
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse atualizarEmail(Integer id, AtualizarEmailUsuarioRequest dto) {
        Usuario usuario = buscarEntidadePorId(id);

        validarSenha(usuario, dto.senha());

        if (!dto.emailNovo().equals(usuario.getEmail())
                && usuarioRepository.existsByEmail(dto.emailNovo())) {
            throw new ResourceAlreadyExistsException("Usuário", "email", dto.emailNovo());
        }

        usuario.setEmail(dto.emailNovo());
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    public void atualizarSenha(Integer id, AtualizarSenhaUsuarioRequest dto) {
        Usuario usuario = buscarEntidadePorId(id);

        validarSenha(usuario, dto.senhaAntiga());

        usuario.setSenha(passwordEncoder.encode(dto.senhaNova()));
        usuarioRepository.save(usuario);
    }

    private void validarSenha(Usuario usuario, String senhaInformada) {
        if (senhaInformada == null || !passwordEncoder.matches(senhaInformada, usuario.getSenha())) {
            throw new BusinessException("Senha incorreta.", HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * O script SQL não tem coluna de status/ativo em "usuario", send assim não existe
     * soft delete possível. Por isso a exclusão é sempre definitiva, e
     * as próprias constraints do banco protegem a integridade:
     *   - produto: ON DELETE CASCADE  -> produtos do usuário são apagados junto
     *   - lance:   ON DELETE RESTRICT -> se o usuário já deu lance, o banco
     *              rejeita a exclusão (vira 409 automaticamente)
     *   - pagamento: ON DELETE RESTRICT -> mesma lógica se já pagou algo
     */
    public void deletar(Integer id) {
        Usuario usuario = buscarEntidadePorId(id);
        usuarioRepository.delete(usuario);
    }

    @Transactional(readOnly = true)
    public List<LeilaoResumoResponse> listarLeiloes(Integer usuarioId) {
        buscarEntidadePorId(usuarioId); // garante 404 se o usuário não existir
        return leilaoRepository.findByProduto_Usuario_Id(usuarioId).stream()
                .map(leilaoMapper::toResponseResumo)
                .toList();
    }

    private Usuario buscarEntidadePorId(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
    }
}