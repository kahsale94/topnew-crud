from sqlalchemy import Column, Integer, DECIMAL, Text
from sqlalchemy.orm import relationship
from src.database import Base

class Produto(Base):
    __tablename__ = "produtos"

    num = Column(Integer, primary_key=True)
    nome = Column(Text, nullable=False, unique=True)
    descricao = Column(Text)
    valor_compra = Column(DECIMAL, nullable=False)
    valor_venda = Column(DECIMAL, nullable=False)
    categoria = Column(Text)

    pedidos = relationship("ItemPedido", back_populates="produto")
    estoque = relationship("Estoque", backref="produto", uselist=False, cascade="all, delete-orphan")