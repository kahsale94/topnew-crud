from sqlalchemy.orm import Session
from src.models import Pedido, ItemPedido
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
                produto_nome = item.produto_nome,
                quantidade = item.quantidade,
                valor_unitario = item.valor_unitario
                )
            db.add(item_db)
        db.commit()
        db.refresh(item_db)

        return pedido
    
    def atualizar_item_pedido(self, db: Session, num_pedido: int, cliente_nome: str, produto_nome: str, valor_unitario: float, quantidade: int):
        pedido = db.query(Pedido).filter(Pedido.num == num_pedido).first()
        if not pedido:
            return None

        if cliente_nome is not None:
            pedido.cliente_nome = cliente_nome

        if produto_nome is not None:
            item_pedido = db.query(ItemPedido).filter(ItemPedido.num_pedido == num_pedido, ItemPedido.produto_nome == produto_nome).first()
            if valor_unitario is not None:
                item_pedido.valor_unitario = valor_unitario
            if quantidade is not None:
                item_pedido.quantidade = quantidade
            db.commit()
            db.refresh(item_pedido)
            itens = db.query(ItemPedido).filter(ItemPedido.num_pedido == num_pedido).all()
            valor = 0
            for item in itens:
                valor += item.quantidade * item.valor_unitario

        db.commit()
        db.refresh(pedido)
        db.refresh(item_pedido)
        return pedido

    def excluir_pedido(self, db: Session, num: int):
        pedido = db.query(Pedido).filter(Pedido.num == num).first()
        if not pedido:
            return False
        db.delete(pedido)
        db.commit()
        return True

    def selecionar_itens_pedido(self, db: Session, num_pedido: int):
        return db.query(ItemPedido).filter(ItemPedido.num_pedido == num_pedido).all()
    
    def selecionar_pedidos(self, db: Session):
        return db.query(Pedido).all()
    