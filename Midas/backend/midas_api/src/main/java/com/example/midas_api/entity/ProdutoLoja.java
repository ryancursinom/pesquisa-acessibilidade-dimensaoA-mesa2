package com.example.midas_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.*;

// JPA
@Entity
@Table(name = "produto_loja")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProdutoLoja {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50, unique = true)
    private String nome;

    @Column(nullable = false, precision = 12, scale = 2)
    private Double preco;

    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

}