from sqlalchemy import Column, Integer, Text
from sqlalchemy.orm import relationship
from src.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    num = Column(Integer, primary_key=True)
    nome = Column(Text, nullable=False, unique=True)
    telefone = Column(Text, nullable=False, unique=True)
    endereco = Column(Text, nullable=False, unique=True)

    pedidos = relationship("Pedido", back_populates="cliente", cascade="all, delete")