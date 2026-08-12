from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY
from app.prompts.acessibilidade_prompt import PROMPT_ACESSIBILIDADE


client = genai.Client(
    api_key=GEMINI_API_KEY
)


def gerar_descricao(
    imagem_bytes: bytes,
    mime_type: str,
    produto: dict,
    identidade_visual: dict | None
) -> str:

    if identidade_visual is None:
        identidade_visual = {}

    contexto = f"""
INFORMAÇÕES DO PRODUTO:

Nome:
{produto.get("nome", "Não informado")}

INFORMAÇÕES VISUAIS DO BANCO:

Cor primária:
{identidade_visual.get("cor_primaria", "Não informado")}

Cor secundária:
{identidade_visual.get("cor_secundaria", "Não informado")}

Descrição da paleta:
{identidade_visual.get("descricao_paleta", "Não informado")}

Formato:
{identidade_visual.get("formato", "Não informado")}

Descrição do formato:
{identidade_visual.get("descricao_formato", "Não informado")}

Descrição visual previamente cadastrada:
{identidade_visual.get("descricao_geral", "Não informado")}
"""

    resposta = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(
                data=imagem_bytes,
                mime_type=mime_type
            ),
            PROMPT_ACESSIBILIDADE,
            contexto
        ]
    )

    if not resposta.text:
        raise RuntimeError(
            "O Gemini não retornou uma descrição."
        )

    return resposta.text.strip()