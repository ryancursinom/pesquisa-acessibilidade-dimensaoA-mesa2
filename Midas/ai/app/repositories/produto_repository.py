from sqlalchemy.orm import Session

from app.models.produto import Produto


class ProdutoRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_todos(self):
        return self.db.query(Produto).all()

    def buscar_por_id(self, produto_id: int):
        return self.db.query(Produto).filter(Produto.id == produto_id).first()
