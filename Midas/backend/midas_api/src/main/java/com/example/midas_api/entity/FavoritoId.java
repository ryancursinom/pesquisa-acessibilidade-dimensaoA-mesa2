package com.example.midas_api.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class FavoritoId implements Serializable {

    private Integer usuarioId;
    private Integer leilaoId;

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Integer getLeilaoId() {
        return leilaoId;
    }

    public void setLeilaoId(Integer leilaoId) {
        this.leilaoId = leilaoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FavoritoId that)) return false;
        return Objects.equals(usuarioId, that.usuarioId) && Objects.equals(leilaoId, that.leilaoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(usuarioId, leilaoId);
    }
}