from sqlalchemy.orm import Session
from src.models.produto_model import Produto
from src.models.estoque_model import Estoque

class ProdutoRepository:

    def criar_produto(self, db: Session, nome: str, descricao: str, valor_compra: float, valor_venda: float, categoria: str):

        existente = db.query(Produto).filter(Produto.nome == nome).first()
        if existente:
            return None

        produto = Produto(
            nome = nome,
            descricao = descricao,
            valor_compra = valor_compra,
            valor_venda = valor_venda,
            categoria = categoria
            )
        
        db.add(produto)
        db.commit()
        db.refresh(produto)
        db.flush()

        estoque = Estoque(num_produto=produto.num)
        db.add(estoque)

        db.commit()
        db.refresh(estoque)

        return produto
    
    def atualizar_produto(self, db: Session, num: int, nome: str, descricao: str, valor_compra: float, valor_venda: float, categoria: str):

        produto = db.query(Produto).filter(Produto.num == num).first()
        if not produto:
            return None
        
        if nome is not None:
            existente = db.query(Produto).filter(Produto.nome == nome, Produto.num != num).all()
            if existente:
                return "duplicado"
            produto.nome = nome

        if descricao is not None:
            produto.descricao = descricao
        if valor_compra is not None:
            produto.valor_compra = valor_compra
        if valor_venda is not None:
            produto.valor_venda = valor_venda
        if categoria is not None:
            produto.categoria = categoria

        db.commit()
        db.refresh(produto)

        return produto

    def excluir_produto(self, db: Session, num: int):

        produto = db.query(Produto).filter(Produto.num == num).first()
        if not produto:
            return None
        
        db.delete(produto)
        db.commit()
        
        return True

    def selecionar_produto(self, db: Session, num: int):
        return db.query(Produto).filter(Produto.num == num).first()
    
    def selecionar_todos(self, db: Session):
        return db.query(Produto).all()