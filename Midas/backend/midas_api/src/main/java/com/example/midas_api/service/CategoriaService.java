package com.example.midas_api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.midas_api.dto.categoria.CategoriaResponse;
import com.example.midas_api.entity.Categoria;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.CategoriaMapper;
import com.example.midas_api.repository.CategoriaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final CategoriaMapper categoriaMapper;

    public List<CategoriaResponse> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(categoriaMapper::toResponse)
                .toList();
    }

    public CategoriaResponse buscarPorId(Integer id) {
        Categoria categoria = buscarEntidadePorId(id);
        return categoriaMapper.toResponse(categoria);
    }

    public Categoria buscarEntidadePorId(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", id));
    }
}