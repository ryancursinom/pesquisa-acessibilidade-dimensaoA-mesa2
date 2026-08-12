from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MIDAS AI"
    gemini_api_key: str = ""
    database_url: str = "sqlite:///./midas.db"

    class Config:
        env_file = ".env"


settings = Settings()
