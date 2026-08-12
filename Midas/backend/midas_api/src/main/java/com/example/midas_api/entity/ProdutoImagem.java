package com.example.midas_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.*;

// JPA
@Entity
@Table(name = "produto_imagem")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProdutoImagem {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto idProduto;

    @Column(length = 1024)
    private String url;

    @Column(name = "ordem")
    private Integer ordem;
}