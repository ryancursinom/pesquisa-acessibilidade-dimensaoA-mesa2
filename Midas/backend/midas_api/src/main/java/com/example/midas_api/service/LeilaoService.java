package com.example.midas_api.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.midas_api.dto.leilao.AtualizarLeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoRequest;
import com.example.midas_api.dto.leilao.LeilaoResponse;
import com.example.midas_api.entity.Leilao;
import com.example.midas_api.entity.Produto;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.entity.enums.StatusProduto;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.LeilaoMapper;
import com.example.midas_api.repository.LeilaoRepository;
import com.example.midas_api.repository.ProdutoRepository;
import com.example.midas_api.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class LeilaoService {

    private final LeilaoRepository leilaoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LeilaoMapper leilaoMapper;

    /*
     * usuarioId fica separado do DTO enquanto a autenticação ainda não existe.
     * Depois, ele deve vir do usuário autenticado.
     */
    public LeilaoResponse criar(LeilaoRequest dto, Integer usuarioId) {

        usuarioRepository.findById(usuarioId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuário", usuarioId));

        Produto produto = buscarProduto(dto.produtoId());

        validarPosse(produto, usuarioId);

        if (produto.getStatus() != StatusProduto.DISPONIVEL) {
            throw new BusinessException(
                    "O produto não está disponível para ser colocado em leilão."
            );
        }

        if (leilaoRepository.existsByProduto_Id(dto.produtoId())) {
            throw new ResourceAlreadyExistsException(
                    "Leilão",
                    "produtoId",
                    dto.produtoId()
            );
        }

        validarDatas(dto.dataInicio(), dto.dataFim());

        Leilao leilao = leilaoMapper.toEntity(dto);

        leilao.setProduto(produto);
        leilao.setStatus(StatusLeilao.AGUARDANDO);

        /*
         * O produto passa a estar reservado para um leilão.
         */
        produto.setStatus(StatusProduto.EM_LEILAO);

        return leilaoMapper.toResponse(
                leilaoRepository.save(leilao)
        );
    }

    @Transactional(readOnly = true)
    public List<LeilaoResponse> listar(StatusLeilao status) {

        List<Leilao> leiloes = status == null
                ? leilaoRepository.findAll()
                : leilaoRepository.findByStatus(status);

        return leiloes.stream()
                .map(leilaoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeilaoResponse buscarPorId(Integer id) {
        return leilaoMapper.toResponse(
                buscarEntidadePorId(id)
        );
    }

    public LeilaoResponse atualizar(
            Integer id,
            AtualizarLeilaoRequest dto,
            Integer usuarioId) {

        Leilao leilao = buscarEntidadePorId(id);

        validarPosse(leilao.getProduto(), usuarioId);

        exigirStatus(
                leilao,
                StatusLeilao.AGUARDANDO,
                "Só é possível atualizar um leilão que ainda está aguardando o início."
        );

        LocalDateTime dataInicio = dto.dataInicio() != null
                ? dto.dataInicio()
                : leilao.getDataInicio();

        LocalDateTime dataFim = dto.dataFim() != null
                ? dto.dataFim()
                : leilao.getDataFim();

        validarDatas(dataInicio, dataFim);

        leilaoMapper.toUpdate(dto, leilao);

        return leilaoMapper.toResponse(
                leilaoRepository.save(leilao)
        );
    }

    /*
     * O status não é recebido pelo usuário.
     * O back-end é responsável por realizar a transição.
     */
    public LeilaoResponse ativar(Integer id, Integer usuarioId) {

        Leilao leilao = buscarEntidadePorId(id);

        validarPosse(leilao.getProduto(), usuarioId);

        exigirStatus(
                leilao,
                StatusLeilao.AGUARDANDO,
                "Só é possível ativar um leilão que esteja aguardando."
        );

        if (LocalDateTime.now().isBefore(leilao.getDataInicio())) {
            throw new BusinessException(
                    "O leilão ainda não atingiu a data de início."
            );
        }

        leilao.setStatus(StatusLeilao.ATIVO);

        return leilaoMapper.toResponse(
                leilaoRepository.save(leilao)
        );
    }

    public LeilaoResponse finalizar(Integer id, Integer usuarioId) {

        Leilao leilao = buscarEntidadePorId(id);

        validarPosse(leilao.getProduto(), usuarioId);

        exigirStatus(
                leilao,
                StatusLeilao.ATIVO,
                "Só é possível finalizar um leilão que esteja ativo."
        );

        if (LocalDateTime.now().isBefore(leilao.getDataFim())) {
            throw new BusinessException(
                    "O prazo do leilão ainda não terminou."
            );
        }

        leilao.setStatus(StatusLeilao.FINALIZADO);

        return leilaoMapper.toResponse(
                leilaoRepository.save(leilao)
        );
    }

    public LeilaoResponse cancelar(Integer id, Integer usuarioId) {

        Leilao leilao = buscarEntidadePorId(id);

        validarPosse(leilao.getProduto(), usuarioId);

        if (leilao.getStatus() == StatusLeilao.FINALIZADO
                || leilao.getStatus() == StatusLeilao.CANCELADO) {

            throw new BusinessException(
                    "Não é possível cancelar um leilão finalizado ou já cancelado."
            );
        }

        leilao.setStatus(StatusLeilao.CANCELADO);

        leilao.getProduto().setStatus(StatusProduto.DISPONIVEL);

        return leilaoMapper.toResponse(
                leilaoRepository.save(leilao)
        );
    }

    public void deletar(Integer id, Integer usuarioId) {

        Leilao leilao = buscarEntidadePorId(id);

        validarPosse(leilao.getProduto(), usuarioId);

        exigirStatus(
                leilao,
                StatusLeilao.AGUARDANDO,
                "Só é possível excluir um leilão que ainda esteja aguardando o início. "
                        + "Para os demais casos, use o cancelamento."
        );

        leilao.getProduto().setStatus(StatusProduto.DISPONIVEL);

        leilaoRepository.delete(leilao);
    }

    @Transactional(readOnly = true)
    public Leilao buscarEntidadePorId(Integer id) {

        return leilaoRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Leilão", id));
    }

    private Produto buscarProduto(Integer produtoId) {

        return produtoRepository.findById(produtoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Produto", produtoId));
    }

    private void validarPosse(
            Produto produto,
            Integer usuarioId) {

        if (!produto.getUsuario().getId().equals(usuarioId)) {

            throw new BusinessException(
                    "Você não tem permissão para realizar esta operação neste leilão.",
                    org.springframework.http.HttpStatus.FORBIDDEN
            );
        }
    }

    private void validarDatas(
            LocalDateTime dataInicio,
            LocalDateTime dataFim) {

        if (dataFim.isBefore(dataInicio)
                || dataFim.isEqual(dataInicio)) {

            throw new BusinessException(
                    "A data de fim deve ser posterior à data de início."
            );
        }
    }

    private void exigirStatus(
            Leilao leilao,
            StatusLeilao status,
            String mensagem) {

        if (leilao.getStatus() != status) {
            throw new BusinessException(mensagem);
        }
    }
}