package com.example.midas_api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// JPA
@Entity
@Table(name = "favorito")

// Lombok
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Favorito {

    @EmbeddedId
    private FavoritoId id;

    @ToString.Exclude
    @ManyToOne
    @MapsId("usuarioId")
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ToString.Exclude
    @ManyToOne
    @MapsId("leilaoId")
    @JoinColumn(name = "id_leilao", nullable = false)
    private Leilao leilao;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime dataAdicao;
}
