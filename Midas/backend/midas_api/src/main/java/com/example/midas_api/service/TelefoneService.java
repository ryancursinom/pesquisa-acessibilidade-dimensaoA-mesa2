package com.example.midas_api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.midas_api.dto.telefone.AtualizarTelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneRequest;
import com.example.midas_api.dto.telefone.TelefoneResponse;
import com.example.midas_api.entity.Telefone;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.TelefoneMapper;
import com.example.midas_api.repository.TelefoneRepository;
import com.example.midas_api.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TelefoneService {

    private final TelefoneRepository telefoneRepository;
    private final UsuarioRepository usuarioRepository;
    private final TelefoneMapper telefoneMapper;

    public TelefoneResponse criar(TelefoneRequest dto) {
        if (telefoneRepository.existsByTelefone(dto.telefone())) {
            throw new ResourceAlreadyExistsException("Telefone", "telefone", dto.telefone());
        }

        Usuario usuario = usuarioRepository.findById(dto.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", dto.userId()));

        Telefone telefone = telefoneMapper.toEntity(dto);
        telefone.setUsuario(usuario);

        return telefoneMapper.toResponse(telefoneRepository.save(telefone));
    }

    @Transactional(readOnly = true)
    public List<TelefoneResponse> listarPorUsuario(Integer usuarioId) {
        return telefoneRepository.findByUsuario_Id(usuarioId).stream()
                .map(telefoneMapper::toResponse)
                .toList();
    }

    public TelefoneResponse atualizar(Integer id, AtualizarTelefoneRequest dto) {
        Telefone telefone = buscarEntidadePorId(id);

        if (dto.telefone() != null && !dto.telefone().equals(telefone.getTelefone())
                && telefoneRepository.existsByTelefone(dto.telefone())) {
            throw new ResourceAlreadyExistsException("Telefone", "telefone", dto.telefone());
        }

        telefoneMapper.toUpdate(dto, telefone);
        return telefoneMapper.toResponse(telefoneRepository.save(telefone));
    }

    public void deletar(Integer id) {
        Telefone telefone = buscarEntidadePorId(id);
        telefoneRepository.delete(telefone);
    }

    private Telefone buscarEntidadePorId(Integer id) {
        return telefoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Telefone", id));
    }
}