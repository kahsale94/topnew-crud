from sqlalchemy.orm import Session
from src.models import Pedido, ItemPedido, Produto, Cliente
from typing import List

class PedidoRepository:

    def criar_pedido(self, db: Session, num_cliente: int, itens: List[ItemPedido], forma_pagamento: str, pago: bool):
        valor = 0
        for item in itens:
            valor += item.quantidade * item.valor_unitario

        pedido = Pedido(
            num_cliente = num_cliente,
            valor = valor,
            forma_pagamento = forma_pagamento,
            pago = pago
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

        pedido_retorno= {
            "num": pedido.num,
            "num_cliente": pedido.num_cliente,
            "nome_cliente": pedido.cliente.nome,
            "valor": pedido.valor,
            "forma_pagamento": pedido.forma_pagamento,
            "pago": pedido.pago,
            "data": pedido.data
        }
        return pedido_retorno
    
    def atualizar_pedido(self, db: Session, num_pedido: int, num_cliente: int, forma_pagamento: str, pago: bool):

        pedido = db.query(Pedido).filter(Pedido.num == num_pedido).first()

        if not pedido:
            return None

        if num_cliente is not None:
            pedido.num_cliente = num_cliente

        if forma_pagamento is not None:
            pedido.forma_pagamento = forma_pagamento

        if pago is not None:
            pedido.pago = pago

        db.commit()
        db.refresh(pedido)

        pedido_retorno= {
            "num": pedido.num,
            "num_cliente": pedido.num_cliente,
            "nome_cliente": pedido.cliente.nome,
            "valor": pedido.valor,
            "forma_pagamento": pedido.forma_pagamento,
            "pago": pedido.pago,
            "data": pedido.data
        }
        return pedido_retorno

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

        pedido_retorno= {
            "num": pedido.num,
            "num_cliente": pedido.num_cliente,
            "nome_cliente": pedido.cliente.nome,
            "valor": pedido.valor,
            "forma_pagamento": pedido.forma_pagamento,
            "pago": pedido.pago,
            "data": pedido.data
        }
        return pedido_retorno

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
            item_retorno= {
                "num": item.num,
                "num_pedido": item.num_pedido,
                "num_produto": item.num_produto,
                "nome_produto": item.produto.nome,
                "quantidade": item.quantidade,
                "valor_unitario": item.valor_unitario
            }
            itens_retorno.append(item_retorno)
        return itens_retorno
    
    def selecionar_pedidos(self, db: Session):
        pedidos = db.query(Pedido).all()
        pedidos_retorno = []
        for pedido in pedidos:
            pedido_retorno= {
                "num": pedido.num,
                "num_cliente": pedido.num_cliente,
                "nome_cliente": pedido.cliente.nome,
                "valor": pedido.valor,
                "forma_pagamento": pedido.forma_pagamento,
                "pago": pedido.pago,
                "data": pedido.data
            }
            pedidos_retorno.append(pedido_retorno)
        return pedidos_retorno
    