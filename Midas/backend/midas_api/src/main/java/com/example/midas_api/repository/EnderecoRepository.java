package com.example.midas_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.midas_api.entity.Endereco;

public interface EnderecoRepository extends JpaRepository<Endereco, Integer> {
}