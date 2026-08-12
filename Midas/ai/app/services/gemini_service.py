class GeminiService:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def gerar_resposta(self, prompt: str) -> str:
        return f"Resposta simulada do Gemini para: {prompt}"
