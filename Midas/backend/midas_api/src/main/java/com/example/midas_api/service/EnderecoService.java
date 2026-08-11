package com.example.midas_api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.midas_api.dto.endereco.AtualizarEnderecoRequest;
import com.example.midas_api.dto.endereco.EnderecoRequest;
import com.example.midas_api.dto.endereco.EnderecoResponse;
import com.example.midas_api.entity.Endereco;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.EnderecoMapper;
import com.example.midas_api.repository.EnderecoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final EnderecoMapper enderecoMapper;

    public EnderecoResponse criar(EnderecoRequest dto) {
        Endereco endereco = enderecoMapper.toEntity(dto);
        return enderecoMapper.toResponse(enderecoRepository.save(endereco));
    }

    @Transactional(readOnly = true)
    public EnderecoResponse buscarPorId(Integer id) {
        return enderecoMapper.toResponse(buscarEntidadePorId(id));
    }

    public Endereco buscarEntidadePorId(Integer id) {
        return enderecoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", id));
    }

    public EnderecoResponse atualizar(Integer id, AtualizarEnderecoRequest dto) {
        Endereco endereco = buscarEntidadePorId(id);
        enderecoMapper.toUpdate(dto, endereco);
        return enderecoMapper.toResponse(enderecoRepository.save(endereco));
    }

    public void deletar(Integer id) {
        Endereco endereco = buscarEntidadePorId(id);
        // Endereco.usuario é @OneToOne(nullable = false) do lado do Usuario.
        // Se este endereço ainda estiver vinculado a um usuário, o banco vai
        // rejeitar via constraint de FK -> DataIntegrityViolationException,
        // que o GlobalExceptionHandler já converte pra 409 automaticamente.
        enderecoRepository.delete(endereco);
    }
}