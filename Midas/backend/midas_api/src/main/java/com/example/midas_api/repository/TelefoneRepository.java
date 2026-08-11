package com.example.midas_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.midas_api.entity.Telefone;

public interface TelefoneRepository extends JpaRepository<Telefone, Integer> {

    List<Telefone> findByUsuario_Id(Integer usuarioId);

    boolean existsByTelefone(String telefone);
}