import os
from dotenv import load_dotenv

load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")


if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY não configurada.")

if not DB_HOST:
    raise RuntimeError("DB_HOST não configurado.")

if not DB_NAME:
    raise RuntimeError("DB_NAME não configurado.")

if not DB_USER:
    raise RuntimeError("DB_USER não configurado.")

if not DB_PASSWORD:
    raise RuntimeError("DB_PASSWORD não configurado.")