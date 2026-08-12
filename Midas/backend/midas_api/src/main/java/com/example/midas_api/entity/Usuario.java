package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(nullable = false, length = 50, unique = true)
    private String username;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senha;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime dataCadastro;

    @Column(name = "avaliacao_media", precision = 3, scale = 2)
    @Builder.Default
    private Double avaliacaoMedia = 0.0;

    @OneToMany(mappedBy = "usuario")
    private List<Telefone> telefones;

    @OneToMany(mappedBy = "usuario")
    private List<Produto> produtos;

    @OneToMany(mappedBy = "usuario")
    private List<Lance> lances;
}
