package com.example.midas_api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.midas_api.dto.raridade.RaridadeResponse;
import com.example.midas_api.service.RaridadeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/raridades")
@RequiredArgsConstructor
public class RaridadeController {

    private final RaridadeService raridadeService;

    @GetMapping
    public ResponseEntity<List<RaridadeResponse>> listarTodas() {
        return ResponseEntity.ok(raridadeService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RaridadeResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(raridadeService.buscarPorId(id));
    }
}