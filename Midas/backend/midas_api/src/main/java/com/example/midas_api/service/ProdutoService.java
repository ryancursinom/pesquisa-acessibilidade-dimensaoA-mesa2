package com.example.midas_api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.midas_api.dto.produto.AtualizarProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoRequest;
import com.example.midas_api.dto.produto.ProdutoResponse;
import com.example.midas_api.entity.Categoria;
import com.example.midas_api.entity.EstadoFisico;
import com.example.midas_api.entity.Produto;
import com.example.midas_api.entity.Raridade;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.entity.enums.StatusProduto;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.ProdutoMapper;
import com.example.midas_api.repository.CategoriaRepository;
import com.example.midas_api.repository.EstadoFisicoRepository;
import com.example.midas_api.repository.LeilaoRepository;
import com.example.midas_api.repository.ProdutoRepository;
import com.example.midas_api.repository.RaridadeRepository;
import com.example.midas_api.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

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

    /**
     * usuarioId é recebido à parte (não vem no ProdutoRequest) porque ainda
     * não existe autenticação. Quando existir, trocar este parâmetro por
     * um usuarioId extraído do usuário autenticado
     */
    public ProdutoResponse criar(ProdutoRequest dto, Integer usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));
        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", dto.categoriaId()));
        EstadoFisico estadoFisico = estadoFisicoRepository.findById(dto.estadoFisicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Estado físico", dto.estadoFisicoId()));
        Raridade raridade = raridadeRepository.findById(dto.raridadeId())
                .orElseThrow(() -> new ResourceNotFoundException("Raridade", dto.raridadeId()));

        // O mapper já monta a IdentidadeVisual (objeto novo, será persistida
        // via cascade) e deixa categoria/estadoFisico/raridade só com o id
        // preenchido — sobrescrevemos abaixo com as entidades gerenciadas
        // que acabamos de buscar, garantindo que elas de fato existem.
        Produto produto = produtoMapper.toEntity(dto);
        produto.setUsuario(usuario);
        produto.setCategoria(categoria);
        produto.setEstadoFisico(estadoFisico);
        produto.setRaridade(raridade);
        produto.setStatus(StatusProduto.DISPONIVEL);

        return produtoMapper.toResponse(produtoRepository.save(produto));
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(Integer id) {
        return produtoMapper.toResponse(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarDisponiveis() {
        return produtoRepository.findByStatus(StatusProduto.DISPONIVEL).stream()
                .map(produtoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarPorUsuario(Integer usuarioId) {
        return produtoRepository.findByUsuario_Id(usuarioId).stream()
                .map(produtoMapper::toResponse)
                .toList();
    }

    public ProdutoResponse atualizar(Integer id, AtualizarProdutoRequest dto, Integer usuarioId) {
        Produto produto = buscarEntidadePorId(id);
        validarPosse(produto, usuarioId);

        // "bloqueado se já estiver em um leilão ativo".
        if (produto.getStatus() == StatusProduto.EM_LEILAO) {
            throw new BusinessException("Não é possível atualizar um produto que já está em leilão.");
        }

        produtoMapper.toUpdate(dto, produto); // categoria/estadoFisico/raridade ignorados de propósito no mapper

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

        return produtoMapper.toResponse(produtoRepository.save(produto));
    }

    public void deletar(Integer id, Integer usuarioId) {
        Produto produto = buscarEntidadePorId(id);
        validarPosse(produto, usuarioId);

        // "exclui apenas se não estiver vinculado a um leilão".
        if (leilaoRepository.existsByProduto_Id(id)) {
            throw new BusinessException("Não é possível excluir um produto vinculado a um leilão.");
        }

        produtoRepository.delete(produto);
    }

    private void validarPosse(Produto produto, Integer usuarioId) {
        if (!produto.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException(
                    "Você não tem permissão para alterar este produto.",
                    org.springframework.http.HttpStatus.FORBIDDEN
            );
        }
    }

    private Produto buscarEntidadePorId(Integer id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }
}