from sqlalchemy.orm import Session
from src.models import Pedido, ItemPedido, Produto
from typing import List

class PedidoRepository:

    def criar_pedido(self, db: Session, cliente_nome: str, itens: List[ItemPedido]):
        valor = 0
        for item in itens:
            valor += item.quantidade * item.valor_unitario

        pedido = Pedido(
            cliente_nome = cliente_nome,
            valor = valor
            )
        
        db.add(pedido)
        db.commit()
        db.refresh(pedido)

        for item in itens:
            item_db = ItemPedido(
                num_pedido = pedido.num,
                num_produto = item.num_produto,
                quantidade = item.quantidade,
                valor_unitario = item.valor_unitario
                )
            db.add(item_db)
        db.commit()
        db.refresh(item_db)

        return pedido
    
    def atualizar_item_pedido(self, db: Session, num_pedido: int, num_item: int, num_produto: int, valor_unitario: float, quantidade: int):

        item_pedido = db.query(ItemPedido).filter(ItemPedido.num_pedido == num_pedido, ItemPedido.num == num_item).first()

        item_pedido.num_produto = num_produto
        item_pedido.valor_unitario = valor_unitario
        item_pedido.quantidade = quantidade

        db.commit()
        db.refresh(item_pedido)

        itens = db.query(ItemPedido).filter(ItemPedido.num_pedido == num_pedido).all()
        valor = 0
        for item in itens:
            valor += item.quantidade * item.valor_unitario

        pedido = db.query(Pedido).filter(Pedido.num == num_pedido).first()
        if not pedido:
            return None
        pedido.valor = valor

        db.commit()
        db.refresh(pedido)
        return pedido

    def excluir_item_pedido(self, db: Session, num_pedido: int, num_item: int):
        item_pedido = db.query(ItemPedido).filter(ItemPedido.num_pedido == num_pedido, ItemPedido.num == num_item).first()
        if not item_pedido:
            return False
        db.delete(item_pedido)

        itens = db.query(ItemPedido).filter(ItemPedido.num_pedido == num_pedido).all()
        valor = 0
        for item in itens:
            valor += item.quantidade * item.valor_unitario
        pedido = db.query(Pedido).filter(Pedido.num == num_pedido).first()
        if not pedido:
            return None
        pedido.valor = valor

        db.commit()
        db.refresh(pedido)
        return True
    
    def excluir_pedido(self, db: Session, num: int):
        pedido = db.query(Pedido).filter(Pedido.num == num).first()
        if not pedido:
            return False
        db.delete(pedido)
        db.commit()
        return True

    def selecionar_itens_pedido(self, db: Session, num_pedido: int):
        itens = db.query(ItemPedido).filter(ItemPedido.num_pedido == num_pedido).all()
        itens_retorno = []
        for item in itens:
            nome = db.query(Produto).filter(Produto.num == item.num_produto).first()
            item_retorno= {
                "num": item.num,
                "num_pedido": item.num_pedido,
                "num_produto": item.num_produto,
                "nome_produto": nome.nome,
                "quantidade": item.quantidade,
                "valor_unitario": item.valor_unitario
            }
            itens_retorno.append(item_retorno)
        return itens_retorno
    
    def selecionar_pedidos(self, db: Session):
        return db.query(Pedido).all()
    