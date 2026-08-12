package com.example.midas_api.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FavoritoId implements Serializable {

    private Integer idUsuario;
    private Integer idLeilao;

    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Favorito favorito = (Favorito) o;
        return Objects.equals(idLeilao, favorito.getUsuario().getId()) &&
                Objects.equals(idUsuario, favorito.getLeilao().getId());
    }

    public int hashCode() {
        return Objects.hash(idUsuario, idLeilao);
    }
}
