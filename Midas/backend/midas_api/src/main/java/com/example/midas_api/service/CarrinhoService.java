package com.example.midas_api.service;

import com.example.midas_api.dto.carrinho.*;
import com.example.midas_api.entity.*;
import com.example.midas_api.entity.enums.StatusPedido;
import com.example.midas_api.exception.BusinessException;
import com.example.midas_api.exception.ResourceNotFoundException;
import com.example.midas_api.mapper.CarrinhoMapper;
import com.example.midas_api.mapper.PedidoMapper;
import com.example.midas_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final CarrinhoItemRepository itemRepository;
    private final ProdutoLojaRepository produtoLojaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarrinhoMapper carrinhoMapper;
    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final PedidoMapper pedidoMapper;

    @Transactional
    public CarrinhoResponse buscar(Integer usuarioId) {
        Carrinho carrinho = obterOuCriar(usuarioId);
        return montarResponse(carrinho);
    }

    public CarrinhoResponse adicionar(Integer usuarioId, AdicionarCarrinhoItemRequest dto) {
        Carrinho carrinho = obterOuCriar(usuarioId);
        ProdutoLoja produto = produtoLojaRepository.findById(dto.produtoLojaId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto da loja", dto.produtoLojaId()));

        CarrinhoItem item = itemRepository
                .findByCarrinho_IdAndProdutoLoja_Id(carrinho.getId(), produto.getId())
                .orElseGet(() -> CarrinhoItem.builder()
                        .carrinho(carrinho)
                        .produtoLoja(produto)
                        .quantidade(0)
                        .build());

        item.setQuantidade(item.getQuantidade() + dto.quantidade());
        itemRepository.save(item);
        recalcular(carrinho);

        return montarResponse(carrinho);
    }

    public CarrinhoResponse atualizarItem(Integer usuarioId, Integer itemId, AtualizarCarrinhoItemRequest dto) {
        Carrinho carrinho = obterOuCriar(usuarioId);
        CarrinhoItem item = itemRepository.findByIdAndCarrinho_Id(itemId, carrinho.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Item do carrinho", itemId));

        item.setQuantidade(dto.quantidade());
        recalcular(carrinho);

        return montarResponse(carrinho);
    }

    public void removerItem(Integer usuarioId, Integer itemId) {
        Carrinho carrinho = obterOuCriar(usuarioId);
        CarrinhoItem item = itemRepository.findByIdAndCarrinho_Id(itemId, carrinho.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Item do carrinho", itemId));

        itemRepository.delete(item);
        recalcular(carrinho);
    }

    public void limpar(Integer usuarioId) {
        Carrinho carrinho = obterOuCriar(usuarioId);
        itemRepository.findAll().stream()
                .filter(i -> i.getCarrinho().getId().equals(carrinho.getId()))
                .forEach(itemRepository::delete);
        carrinho.setQtdItens(0);
        carrinho.setTotal(0.0);
        carrinhoRepository.save(carrinho);
    }

    /**
     * Converte o carrinho em pedido e preserva no pedido_item o preço vigente
     * no momento do checkout.
     */
    public com.example.midas_api.dto.pedido.PedidoResponse checkout(Integer usuarioId) {
        Carrinho carrinho = obterOuCriar(usuarioId);
        recalcular(carrinho);
        List<CarrinhoItem> itens = itemRepository.findAll().stream()
                .filter(i -> i.getCarrinho().getId().equals(carrinho.getId()))
                .toList();

        if (itens.isEmpty()) {
            throw new BusinessException("Não é possível criar um pedido com o carrinho vazio.");
        }

        Usuario usuario = carrinho.getUsuario();
        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .status(StatusPedido.AGUARDANDO_PAGAMENTO)
                .valorTotal(carrinho.getTotal())
                .build();
        pedido = pedidoRepository.save(pedido);

        for (CarrinhoItem item : itens) {
            double preco = item.getProdutoLoja().getPreco();
            PedidoItem pedidoItem = PedidoItem.builder()
                    .pedido(pedido)
                    .produtoLoja(item.getProdutoLoja())
                    .quantidade(item.getQuantidade())
                    .precoUnitario(preco)
                    .subtotal(preco * item.getQuantidade())
                    .build();
            pedidoItemRepository.save(pedidoItem);
        }

        itemRepository.deleteAll(itens);
        carrinho.setQtdItens(0);
        carrinho.setTotal(0.0);
        carrinhoRepository.save(carrinho);

        List<com.example.midas_api.dto.pedido.PedidoItemResponse> pedidoItens =
                pedidoItemRepository.findAll().stream()
                        .filter(i -> i.getPedido().getId().equals(pedido.getId()))
                        .map(pedidoMapper::toItemResponse)
                        .toList();

        return new com.example.midas_api.dto.pedido.PedidoResponse(
                pedido.getId(),
                pedido.getUsuario().getId(),
                pedido.getStatus(),
                pedido.getValorTotal(),
                pedido.getCriadoEm(),
                pedido.getAtualizadoEm(),
                pedidoItens);
    }

    private Carrinho obterOuCriar(Integer usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", usuarioId));

        return carrinhoRepository.findByUsuario_Id(usuarioId)
                .orElseGet(() -> carrinhoRepository.save(
                        Carrinho.builder()
                                .usuario(usuario)
                                .qtdItens(0)
                                .total(0.0)
                                .build()));
    }

    private void recalcular(Carrinho carrinho) {
        List<CarrinhoItem> itens = itemRepository.findAll().stream()
                .filter(i -> i.getCarrinho().getId().equals(carrinho.getId()))
                .toList();

        int qtd = itens.stream().mapToInt(CarrinhoItem::getQuantidade).sum();
        double total = itens.stream()
                .mapToDouble(i -> i.getQuantidade() * i.getProdutoLoja().getPreco())
                .sum();

        carrinho.setQtdItens(qtd);
        carrinho.setTotal(total);
        carrinhoRepository.save(carrinho);
    }

    private CarrinhoResponse montarResponse(Carrinho carrinho) {
        List<CarrinhoItemResponse> itens = itemRepository.findAll().stream()
                .filter(i -> i.getCarrinho().getId().equals(carrinho.getId()))
                .map(i -> new CarrinhoItemResponse(
                        i.getId(),
                        carrinhoMapper.toProdutoResponse(i.getProdutoLoja()),
                        i.getQuantidade(),
                        i.getQuantidade() * i.getProdutoLoja().getPreco()))
                .toList();

        CarrinhoResponse base = carrinhoMapper.toResponse(carrinho);
        return new CarrinhoResponse(base.id(), base.usuarioId(), base.qtdItens(), base.total(), itens);
    }

}
