package com.example.midas_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.midas_api.entity.Raridade;

public interface RaridadeRepository extends JpaRepository<Raridade, Integer> {

    boolean existsByNome(String nome);
}