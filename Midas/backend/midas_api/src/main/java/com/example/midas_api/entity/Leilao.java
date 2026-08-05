package com.example.midas.entity;

import com.example.midas.entity.enums.StatusLeilao;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

// JPA
@Entity
@Table(name = "leilao")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Leilao {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_inicio",nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_fim",nullable = false)
    private LocalDateTime dataFim;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusLeilao status;

    @ToString.Exclude
    @OneToOne
    @JoinColumn(name = "id_produto", nullable = false, unique = true)
    private Produto produto;

    // Atributos mapeados
    @ToString.Exclude
    @OneToMany(mappedBy = "leilao")
    private List<Lance> lances;
}