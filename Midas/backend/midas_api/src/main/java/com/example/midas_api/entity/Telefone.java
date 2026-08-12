package com.example.midas_api.entity;

import com.example.midas_api.entity.enums.TipoTelefone;
import jakarta.persistence.*;
import lombok.*;

// JPA
@Entity
@Table(name = "telefone")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Telefone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoTelefone tipo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean principal = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;
}