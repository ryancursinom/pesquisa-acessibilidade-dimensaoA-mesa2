from sqlalchemy import Column, Integer, String, Text

from app.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    categoria = Column(String(100), nullable=True)
