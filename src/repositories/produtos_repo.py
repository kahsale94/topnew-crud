from sqlalchemy.orm import Session
from src.models import Produto

class ProdutoRepository:

    def criar_produto(self, db: Session, nome: str, descricao: str, valor: float, categoria: str):
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
    
    def atualizar_produto(self, db: Session, num: int, nome: str, descricao: str, valor: float, categoria: str):
        produto = db.query(Produto).filter(Produto.num == num).first()
        if not produto:
            return None
        
        if nome is not None:
            produto.nome = nome
        if descricao is not None:
            produto.descricao = descricao
        if valor is not None:
            produto.valor = valor
        if categoria is not None:
            produto.categoria = categoria

        db.commit()
        db.refresh(produto)
        return produto

    def excluir_produto(self, db: Session, num: int):
        produto = db.query(Produto).filter(Produto.num == num).first()
        if not produto:
            return False
        
        db.delete(produto)
        db.commit()
        return True

    def selecionar_produto(self, db: Session, num: int):
        return db.query(Produto).filter(Produto.num == num).first()
    
    def selecionar_todos(self, db: Session):
        return db.query(Produto).all()