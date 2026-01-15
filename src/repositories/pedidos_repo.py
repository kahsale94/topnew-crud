from sqlalchemy.orm import Session
from src.models import Pedido

class PedidoRepository:

    def criar_pedido(self, db: Session, valor: float, produtos_nomes: str, cliente_nome: str):
        pedido = Pedido(
            valor = valor,
            produtos_nomes = produtos_nomes,
            cliente_nome = cliente_nome
            )
        
        db.add(pedido)
        db.commit()
        db.refresh(pedido)
        return pedido

    def select_all(self, db: Session):
        return db.query(Pedido).all()