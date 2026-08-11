package com.example.midas_api.entity;

import com.example.midas_api.entity.enums.MeioPagamento;
import com.example.midas_api.entity.enums.StatusPagamento;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// JPA
@Entity
@Table(name = "pagamento")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Pagamento {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "meio_pagamento", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private MeioPagamento meioPagamento;

    @Column(nullable = false)
    private Double valorTotal;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusPagamento status;

    private LocalDateTime dataPagamento;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime criadoEm;

    @ToString.Exclude
    @OneToOne
    @JoinColumn(name = "id_leilao", nullable = false, unique = true)
    private Leilao leilao;

    // Quem pagou. Note que isso é o USUÁRIO ARREMATANTE (maior lance), não o
    // dono do produto/leilão — validar essa regra no PagamentoService.
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;
}