package com.example.midas_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.midas_api.entity.EstadoFisico;

public interface EstadoFisicoRepository extends JpaRepository<EstadoFisico, Integer> {

    boolean existsByNome(String nome);
}