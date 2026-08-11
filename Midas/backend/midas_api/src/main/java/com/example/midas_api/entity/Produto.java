package com.example.midas_api.entity;

import com.example.midas_api.entity.enums.StatusProduto;
import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

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
    private Integer id;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(name = "url_imagem", nullable = false, length = 1024)
    private String urlImagem;

    private Integer anoFabricacao;

    private Integer anoLancamento;

    @Column(columnDefinition = "TEXT")
    @Size(max = 1000)
    private String resumoDescricao;

    @Column(length = 100)
    private String marca;

    @Positive
    private Double peso;

    // Lance inicial mínimo aceito quando o produto for a leilão.
    @Column(nullable = false)
    @Positive
    private Double lanceMinimo;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusProduto status;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime criadoEm;

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

    // SQL: id_identidade_visual é opcional (ON DELETE SET NULL, sem NOT NULL).
    @ToString.Exclude
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_identidade_visual")
    private IdentidadeVisual identidadeVisual;
}