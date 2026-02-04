from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey, func
from src.database import Base

class Estoque(Base):
    __tablename__ = "estoque"

    num_produto = Column(Integer, ForeignKey("produtos.num", ondelete="CASCADE"), primary_key=True)
    ultima_atualizacao = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    estoque_atual = Column(Integer, default=0)
    estoque_minimo = Column(Integer, default=0)