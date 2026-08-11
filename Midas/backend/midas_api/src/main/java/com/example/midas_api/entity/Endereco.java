package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;

//JPA
@Entity
@Table(name = "endereco")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Endereco{
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 10)
    private String cep;

    @Column(nullable = false, length = 255)
    private String logradouro;

    @Column(nullable = false, length = 100)
    private String bairro;

    @Column(nullable = false, length = 100)
    private String cidade;

    private Integer numero;

    @Column(nullable = false, length = 2)
    private String estado;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String pais = "Brasil";

    @Column(length = 255)
    private String complemento;
}