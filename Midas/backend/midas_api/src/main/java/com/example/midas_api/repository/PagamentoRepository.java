package com.example.midas_api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.midas_api.entity.Pagamento;

public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {

    /** Pagamento tem @OneToOne único com Leilao, então no máximo um resultado. */
    Optional<Pagamento> findByLeilao_Id(Integer leilaoId);

    boolean existsByLeilao_Id(Integer leilaoId);
}