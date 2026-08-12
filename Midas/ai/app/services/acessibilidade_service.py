from app.services.gemini_service import GeminiService


class AcessibilidadeService:
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    def analisar_produto(self, texto: str) -> str:
        return self.gemini_service.gerar_resposta(texto)
