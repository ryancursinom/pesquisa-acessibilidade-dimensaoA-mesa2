package com.example.midas_api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.midas_api.dto.pagamento.PagamentoRequest;
import com.example.midas_api.dto.pagamento.PagamentoResponse;
import com.example.midas_api.entity.Lance;
import com.example.midas_api.entity.Leilao;
import com.example.midas_api.entity.Pagamento;
import com.example.midas_api.entity.Usuario;
import com.example.midas_api.entity.enums.StatusLeilao;
import com.example.midas_api.entity.enums.StatusPagamento;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceAlreadyExistsException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.PagamentoMapper;
import com.example.midas_api.repository.LanceRepository;
import com.example.midas_api.repository.LeilaoRepository;
import com.example.midas_api.repository.PagamentoRepository;
import com.example.midas_api.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final LeilaoRepository leilaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LanceRepository lanceRepository;
    private final PagamentoMapper pagamentoMapper;

    public PagamentoResponse iniciar(PagamentoRequest dto) {
        Leilao leilao = leilaoRepository.findById(dto.leilaoId())
                .orElseThrow(() -> new ResourceNotFoundException("Leilão", dto.leilaoId()));

        if (leilao.getStatus() != StatusLeilao.FINALIZADO) {
            throw new BusinessException("Só é possível iniciar o pagamento de um leilão finalizado.");
        }
        if (pagamentoRepository.existsByLeilao_Id(leilao.getId())) {
            throw new ResourceAlreadyExistsException("Pagamento", "leilão", leilao.getId());
        }

        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", dto.usuarioId()));

        // Só quem deu o maior lance (o arrematante) pode pagar o leilão.
        Lance maiorLance = lanceRepository.findTopByLeilao_IdOrderByValorDesc(leilao.getId())
                .orElseThrow(() -> new BusinessException("Este leilão não teve nenhum lance registrado."));

        if (!maiorLance.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("Somente o usuário que arrematou o leilão pode efetuar o pagamento.");
        }

        Pagamento pagamento = pagamentoMapper.toEntity(dto);
        pagamento.setLeilao(leilao);
        pagamento.setUsuario(usuario);
        pagamento.setStatus(StatusPagamento.PENDENTE);

        return pagamentoMapper.toResponse(pagamentoRepository.save(pagamento));
    }

    @Transactional(readOnly = true)
    public PagamentoResponse buscarPorId(Integer id) {
        return pagamentoMapper.toResponse(buscarEntidadePorId(id));
    }

    /**
     * Ponto de entrada para o futuro endpoint de webhook
     * (POST /pagamentos/webhook do gateway de pagamento).
     */
    public PagamentoResponse atualizarStatus(Integer id, StatusPagamento novoStatus) {
        Pagamento pagamento = buscarEntidadePorId(id);
        pagamento.setStatus(novoStatus);
        if (novoStatus == StatusPagamento.APROVADO) {
            pagamento.setDataPagamento(java.time.LocalDateTime.now());
        }
        return pagamentoMapper.toResponse(pagamentoRepository.save(pagamento));
    }

    private Pagamento buscarEntidadePorId(Integer id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pagamento", id));
    }
}
