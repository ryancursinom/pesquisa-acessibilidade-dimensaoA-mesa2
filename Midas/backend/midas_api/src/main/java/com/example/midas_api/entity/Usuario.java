package com.example.midas.entity;

import com.example.midas.entity.enums.StatusUsuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

// JPA
@Entity
@Table(name = "usuario")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Usuario {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 50, unique = true)
    private String username;

    @Column(nullable = false, length = 50, unique = true)
    private String email;

    @Column(nullable = false, length = 100)
    private String senha;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime dataCadastro;

    private Double avaliacaoMedia;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusUsuario status;

    @ToString.Exclude
    @OneToOne
    @JoinColumn(name = "id_endereco", nullable = false)
    private Endereco endereco;

    // Atributos mapeados
    @ToString.Exclude
    @OneToMany(mappedBy = "usuario")
    private List<Telefone> telefones;

    @ToString.Exclude
    @OneToMany(mappedBy = "usuario")
    private List<Produto> produtos;

    @ToString.Exclude
    @OneToMany(mappedBy = "usuario")
    private List<Lance> lances;
}