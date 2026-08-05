package com.example.midas.entity;

import com.example.midas.entity.enums.MeioPagamento;
import com.example.midas.entity.enums.StatusPagamento;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

// JPA
@Entity
@Table(name = "pagamento")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Pagamento {
    // Atributos
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MeioPagamento meioPagamento;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusPagamento status;

    @ToString.Exclude
    @OneToOne
    @JoinColumn(name = "id_leilao", nullable = false)
    private Leilao leilao;
}