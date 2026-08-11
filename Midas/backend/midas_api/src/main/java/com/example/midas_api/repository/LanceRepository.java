package com.example.midas_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.midas_api.entity.Lance;

public interface LanceRepository extends JpaRepository<Lance, Integer> {

    List<Lance> findByLeilao_IdOrderByDataDesc(Integer leilaoId);

    /** Maior lance vigente de um leilão — essencial pra validar um novo lance. */
    Optional<Lance> findTopByLeilao_IdOrderByValorDesc(Integer leilaoId);

    boolean existsByLeilao_Id(Integer leilaoId);

    List<Lance> findByUsuario_Id(Integer usuarioId);
}
