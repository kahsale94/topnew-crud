from sqlalchemy.orm import Session
from src.models import Produto

class ProdutoRepository:

    def criar_produto(self, db: Session, nome: str, descricao: str | None, valor: float, categoria: str | None):
        produto = Produto(
            nome = nome,
            descricao = descricao,
            valor = valor,
            categoria = categoria
            )
        
        db.add(produto)
        db.commit()
        db.refresh(produto)
        return produto

    def select_all(self, db: Session):
        return db.query(Produto).all()