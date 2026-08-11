package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// JPA
@Entity
@Table(name = "lance")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Lance {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    @Builder.Default
    private Double valor = 0.0;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime data;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_leilao", nullable = false)
    private Leilao leilao;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_usuario",nullable = false)
    private Usuario usuario;
}