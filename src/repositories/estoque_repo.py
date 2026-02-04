from sqlalchemy.orm import Session
from src.models.estoque_model import Estoque
from src.models.produto_model import Produto

class EstoqueRepository:

    def atualizar_estoque(self, db: Session, num_produto: int, estoque_atual: int, estoque_minimo: int):

        produto_estoque = db.query(Estoque).filter(Estoque.num_produto == num_produto).first()

        if not produto_estoque:
            return None

        produto_estoque.estoque_atual = estoque_atual
        produto_estoque.estoque_minimo = estoque_minimo

        db.commit()
        db.refresh(produto_estoque)
    
        nome_produto = db.query(Produto).filter(Produto.num == produto_estoque.num_produto).first()
        produto_retorno = {
            "num_produto": produto_estoque.num_produto,
            "nome_produto": nome_produto.nome,
            "ultima_atualizacao": produto_estoque.ultima_atualizacao,
            "estoque_atual": produto_estoque.estoque_atual,
            "estoque_minimo": produto_estoque.estoque_minimo
        }

        return produto_retorno
    
    def zerar_estoque(self, db: Session, num_produto: int):

        produto_estoque = db.query(Estoque).filter(Estoque.num_produto == num_produto).first()

        if not produto_estoque:
            return None

        produto_estoque.estoque_atual = 0

        db.commit()
        db.refresh(produto_estoque)
    
        return True
    
    def selecionar_estoque(self, db: Session):
        itens_estoque = db.query(Estoque).all()
        estoque_retorno = []
        for item in itens_estoque:
            nome_produto = db.query(Produto).filter(Produto.num == item.num_produto).first()
            item_retorno = {
                "num_produto": item.num_produto,
                "nome_produto": nome_produto.nome,
                "ultima_atualizacao": item.ultima_atualizacao,
                "estoque_atual": item.estoque_atual,
                "estoque_minimo": item.estoque_minimo
            }
            estoque_retorno.append(item_retorno)
        return estoque_retorno