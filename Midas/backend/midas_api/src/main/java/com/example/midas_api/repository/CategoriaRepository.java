package com.example.midas_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.midas_api.entity.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    boolean existsByNome(String nome);
}