package com.example.midas_api.service;

import com.example.midas_api.dto.produto.*;
import com.example.midas_api.entity.*;
import com.example.midas_api.entity.enums.StatusProduto;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.ProdutoMapper;
import com.example.midas_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final EstadoFisicoRepository estadoFisicoRepository;
    private final RaridadeRepository raridadeRepository;
    private final LeilaoRepository leilaoRepository;
    private final ProdutoMapper produtoMapper;

    public ProdutoResponse criar(ProdutoRequest dto, Integer usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));

        Produto produto = produtoMapper.toEntity(dto);
        produto.setUsuario(usuario);
        produto.setCategoria(categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", dto.categoriaId())));
        produto.setEstadoFisico(estadoFisicoRepository.findById(dto.estadoFisicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Estado físico", dto.estadoFisicoId())));
        produto.setRaridade(raridadeRepository.findById(dto.raridadeId())
                .orElseThrow(() -> new ResourceNotFoundException("Raridade", dto.raridadeId())));
        produto.setStatus(StatusProduto.DISPONIVEL);

        if (dto.urlImagem() != null && !dto.urlImagem().isBlank()) {
            ProdutoImagem imagem = ProdutoImagem.builder()
                    .url(dto.urlImagem())
                    .ordem(0)
                    .principal(true)
                    .produto(produto)
                    .build();
            produto.setImagens(new ArrayList<>(List.of(imagem)));
        }

        return produtoMapper.toResponse(produtoRepository.save(produto));
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(Integer id) {
        return produtoMapper.toResponse(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarDisponiveis() {
        return produtoRepository.findByStatus(StatusProduto.DISPONIVEL).stream()
                .map(produtoMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarPorUsuario(Integer usuarioId) {
        return produtoRepository.findByUsuario_Id(usuarioId).stream()
                .map(produtoMapper::toResponse).toList();
    }

    public ProdutoResponse atualizar(Integer id, AtualizarProdutoRequest dto, Integer usuarioId) {
        Produto produto = buscarEntidadePorId(id);
        validarPosse(produto, usuarioId);

        if (produto.getStatus() == StatusProduto.EM_LEILAO) {
            throw new BusinessException("Não é possível atualizar um produto que já está em leilão.");
        }

        produtoMapper.toUpdate(dto, produto);

        if (dto.categoria() != null) {
            produto.setCategoria(categoriaRepository.findById(dto.categoria())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria", dto.categoria())));
        }
        if (dto.estadoFisico() != null) {
            produto.setEstadoFisico(estadoFisicoRepository.findById(dto.estadoFisico())
                    .orElseThrow(() -> new ResourceNotFoundException("Estado físico", dto.estadoFisico())));
        }
        if (dto.raridade() != null) {
            produto.setRaridade(raridadeRepository.findById(dto.raridade())
                    .orElseThrow(() -> new ResourceNotFoundException("Raridade", dto.raridade())));
        }

        if (dto.imagem() != null && !dto.imagem().isBlank()) {
            produto.setUrlImagem(dto.imagem());
            ProdutoImagem imagem = ProdutoImagem.builder()
                    .url(dto.imagem())
                    .ordem(produto.getImagens() == null ? 0 : produto.getImagens().size())
                    .principal(produto.getImagens() == null || produto.getImagens().isEmpty())
                    .produto(produto)
                    .build();

            if (produto.getImagens() == null) produto.setImagens(new ArrayList<>());
            produto.getImagens().add(imagem);
        }

        return produtoMapper.toResponse(produto);
    }

    public void deletar(Integer id, Integer usuarioId) {
        Produto produto = buscarEntidadePorId(id);
        validarPosse(produto, usuarioId);

        if (leilaoRepository.existsByProduto_Id(id)) {
            throw new BusinessException("Não é possível excluir um produto vinculado a um leilão.");
        }

        produtoRepository.delete(produto);
    }

    private Produto buscarEntidadePorId(Integer id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    private void validarPosse(Produto produto, Integer usuarioId) {
        if (!produto.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException("Você não tem permissão para alterar este produto.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }
    }
}
