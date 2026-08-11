package com.example.midas_api.entity;

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
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 50, unique = true)
    private String username;

    @Column(nullable = false, length = 50, unique = true)
    private String email;

    // Nome do campo Java continua "senha" por simplicidade, mas a coluna real
    // é "senha_hash": o valor gravado aqui SEMPRE precisa ser o hash (BCrypt),
    // nunca a senha em texto puro — ver PasswordEncoder no UsuarioService.
    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senha;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime dataCadastro;

    @Builder.Default
    private Double avaliacaoMedia = 0.0;

    // A tabela "usuario" do script SQL não tem coluna de status/ativo.
    // Sem este campo não será possível implementar o soft delete

    @ToString.Exclude
    @OneToOne
    @JoinColumn(name = "id_endereco") // SQL permite null (ON DELETE SET NULL)
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
