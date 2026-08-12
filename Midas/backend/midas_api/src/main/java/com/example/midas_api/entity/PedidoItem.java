package com.example.midas_api.entity;

import com.example.midas_api.entity.enums.StatusProduto;
import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// JPA
@Entity
@Table(name = "pedido_item")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PedidoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Carrinho carrinho;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_produto_loja", nullable = false)
    private ProdutoLoja produtoLoja;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_leilao", nullable = false)
    private Leilao leilao;

    @Column(nullable = false)
    @Positive
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false, precision = 12, scale = 2)
    private Double precoUnitario;

    @Column(nullable = false, precision = 12, scale = 2)
    private Double subtotal;
}