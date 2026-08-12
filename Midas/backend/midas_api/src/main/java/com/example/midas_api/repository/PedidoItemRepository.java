package com.example.midas_api.repository;

import com.example.midas_api.entity.PedidoItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoItemRepository extends JpaRepository<PedidoItem, Integer> {
    boolean existsByLeilao_Id(Integer leilaoId);
}
