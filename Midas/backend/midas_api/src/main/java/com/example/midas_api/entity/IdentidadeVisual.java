package com.example.midas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

// JPA
@Entity
@Table(name = "identidade_visual")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class IdentidadeVisual {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 30)
    private String corPrimaria;

    @Column(length = 30)
    private String corSecundaria;

    @Column(name = "descricao_paleta")
    private String descricaoPaleta;

    @Column(nullable = false, length = 10)
    private String formato;

    @Column(name = "descricao_formato")
    private String descricaoFormato;
}