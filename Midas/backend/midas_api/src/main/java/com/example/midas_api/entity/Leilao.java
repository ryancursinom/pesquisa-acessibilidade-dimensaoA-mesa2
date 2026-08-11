package com.example.midas_api.entity;

import com.example.midas_api.entity.enums.StatusLeilao;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

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
    private Integer id;

    @Column(name = "data_inicio",nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_fim",nullable = false)
    private LocalDateTime dataFim;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusLeilao status;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime criadoEm;

    @ToString.Exclude
    @OneToOne
    @JoinColumn(name = "id_produto", nullable = false, unique = true)
    private Produto produto;

    // Atributos mapeados
    @ToString.Exclude
    @OneToMany(mappedBy = "leilao")
    private List<Lance> lances;
}