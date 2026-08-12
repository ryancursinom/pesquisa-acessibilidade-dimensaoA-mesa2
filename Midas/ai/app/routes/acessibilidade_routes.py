from fastapi import APIRouter, HTTPException

from app.services.acessibilidade_service import (
    gerar_descricao_produto
)


router = APIRouter(
    prefix="/acessibilidade",
    tags=["Acessibilidade"]
)


@router.get("/produtos/{produto_id}/descricao")
def descrever_produto(produto_id: int):

    try:

        resultado = gerar_descricao_produto(
            produto_id
        )

        return resultado

    except ValueError as erro:

        raise HTTPException(
            status_code=404,
            detail=str(erro)
        )

    except Exception as erro:

        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar descrição: {erro}"
        )