package com.example.midas_api.entity;

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
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // O banco NÃO tem constraint UNIQUE nessa coluna. A
    // checagem de unicidade que será feita no TelefoneService é só a nível de
    // aplicação —. Para garantia real, a UNIQUE precisa ser adicionada na tabela "telefone".
    @Column(nullable = false, length = 20)
    private String telefone;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;
}