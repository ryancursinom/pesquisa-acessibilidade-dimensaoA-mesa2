package com.example.midas_api.dto.pagamento;


import com.example.midas_api.entity.enums.MeioPagamento;

public record PagamentoRequestDto(

        MeioPagamento meioPagamento,

        Long id
) {}