from pydantic import BaseModel


class Produto(BaseModel):
    id: int
    nome: str
    imagem_url: str


class IdentidadeVisual(BaseModel):
    cor_primaria: str | None = None
    cor_secundaria: str | None = None
    descricao_paleta: str | None = None
    formato: str | None = None
    descricao_formato: str | None = None
    descricao_geral: str | None = None