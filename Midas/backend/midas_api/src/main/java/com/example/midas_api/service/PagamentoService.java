package com.example.midas_api.service;

import com.example.midas_api.dto.pagamento.*;
import com.example.midas_api.entity.*;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.entity.enums.StatusPagamento;
import com.example.midas_api.entity.enums.StatusPedido;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.PagamentoMapper;
import com.example.midas_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final LeilaoRepository leilaoRepository;
    private final LanceRepository lanceRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final PagamentoMapper pagamentoMapper;

    /**
     * Inicia o pagamento de um leilão vencido.
     * O usuário autenticado é o pagador; usuarioId enviado pelo front-end,
     * se existir, não é usado como fonte de identidade.
     */
    public PagamentoResponse iniciar(PagamentoRequest dto, Integer usuarioId) {
        Leilao leilao = leilaoRepository.findById(dto.leilaoId())
                .orElseThrow(() -> new ResourceNotFoundException("Leilão", dto.leilaoId()));

        if (leilao.getStatus() != StatusLeilao.FINALIZADO) {
            throw new BusinessException("Só é possível iniciar o pagamento de um leilão finalizado.");
        }

        if (pedidoItemRepository.existsByLeilao_Id(leilao.getId())) {
            throw new ResourceAlreadyExistsException("Pedido", "leilão", leilao.getId());
        }

        Lance maiorLance = lanceRepository.findTopByLeilao_IdOrderByValorDesc(leilao.getId())
                .orElseThrow(() -> new BusinessException(
                        "Este leilão não teve nenhum lance registrado."));

        if (!maiorLance.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException(
                    "Somente o usuário que arrematou o leilão pode efetuar o pagamento.");
        }

        Usuario pagador = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));

        Usuario recebedor = leilao.getProduto().getUsuario();

        Pedido pedido = Pedido.builder()
                .usuario(pagador)
                .status(StatusPedido.AGUARDANDO_PAGAMENTO)
                .valorTotal(maiorLance.getValor())
                .build();
        pedido = pedidoRepository.save(pedido);

        PedidoItem item = PedidoItem.builder()
                .pedido(pedido)
                .leilao(leilao)
                .quantidade(1)
                .precoUnitario(maiorLance.getValor())
                .subtotal(maiorLance.getValor())
                .build();
        pedidoItemRepository.save(item);

        Pagamento pagamento = Pagamento.builder()
                .pedido(pedido)
                .pagador(pagador)
                .recebedor(recebedor)
                .meioPagamento(dto.meioPagamento())
                .valorTotal(maiorLance.getValor())
                .status(StatusPagamento.PENDENTE)
                .build();

        return pagamentoMapper.toResponse(pagamentoRepository.save(pagamento));
    }

    @Transactional(readOnly = true)
    public PagamentoResponse buscarPorId(Integer id, Integer usuarioId) {
        Pagamento pagamento = buscarEntidadePorId(id);

        if (!pagamento.getPagador().getId().equals(usuarioId)) {
            throw new BusinessException("Você não tem permissão para visualizar este pagamento.",
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }

        return pagamentoMapper.toResponse(pagamento);
    }

    /**
     * Endpoint temporário para simular a confirmação do gateway.
     * Em produção, este método deve ser acionado somente por um webhook
     * autenticado/assinado do provedor de pagamentos.
     */
    public PagamentoResponse atualizarStatus(
            Integer id, StatusPagamento novoStatus, String idTransacao, String txidPix) {

        Pagamento pagamento = buscarEntidadePorId(id);
        pagamento.setStatus(novoStatus);

        if (idTransacao != null) pagamento.setIdTransacao(idTransacao);
        if (txidPix != null) pagamento.setTxidPix(txidPix);

        if (novoStatus == StatusPagamento.APROVADO) {
            pagamento.setDataPagamento(LocalDateTime.now());
            pagamento.getPedido().setStatus(StatusPedido.PAGO);
            pagamento.getPedido().getItens().forEach(item -> {
                if (item.getLeilao() != null) {
                    item.getLeilao().getProduto().setStatus(
                            com.example.midas_api.entity.enums.StatusProduto.VENDIDO);
                }
            });
        }

        return pagamentoMapper.toResponse(pagamento);
    }

    private Pagamento buscarEntidadePorId(Integer id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento", id));
    }
}
