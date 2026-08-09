package com.example.midas.entity;

import com.example.midas.entity.enums.StatusProduto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

// JPA
@Entity
@Table(name = "produto")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Produto {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 500)
    private String urlImagem;


    private Integer anoFabricacao;


    private Integer anoLancamento;

    @Column(columnDefinition = "TEXT")
    @Size(max = 1000)
    private String resumoDescricao;

    @Column(length = 50)
    private String marca;

    @Positive
    private Double peso;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusProduto status;


    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_estado_fisico", nullable = false)
    private EstadoFisico estadoFisico;

    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "id_raridade", nullable = false)
    private Raridade raridade;

    @ToString.Exclude
    @OneToOne
    @JoinColumn(name = "id_identidade_visual", nullable = false)
    private IdentidadeVisual identidadeVisual;
}