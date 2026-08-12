import requests

from app.repositories.produto_repository import (
    buscar_produto,
    buscar_identidade_visual
)

from app.services.gemini_service import gerar_descricao


def obter_imagem(url: str):

    resposta = requests.get(
        url,
        timeout=15
    )

    resposta.raise_for_status()

    content_type = resposta.headers.get(
        "Content-Type",
        ""
    )

    if not content_type.startswith("image/"):
        raise ValueError(
            "A URL fornecida não aponta para uma imagem."
        )

    return resposta.content, content_type


def gerar_descricao_produto(produto_id: int):

    produto = buscar_produto(produto_id)

    if not produto:
        raise ValueError(
            "Produto não encontrado."
        )

    identidade_visual = buscar_identidade_visual(
        produto_id
    )

    imagem_bytes, mime_type = obter_imagem(
        produto["imagem_url"]
    )

    descricao = gerar_descricao(
        imagem_bytes=imagem_bytes,
        mime_type=mime_type,
        produto=produto,
        identidade_visual=identidade_visual
    )

    return {
        "produto_id": produto["id"],
        "produto": produto["nome"],
        "descricao": descricao
    }