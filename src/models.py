from sqlalchemy import Column, Integer, DECIMAL, Text, TIMESTAMP, func, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from src.database import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    num = Column(Integer, primary_key=True)
    valor = Column(DECIMAL, nullable=False)
    data = Column(TIMESTAMP, default=func.now())

    produtos_nomes = Column(Text, ForeignKey("produtos.nome"))
    produtos = relationship("Produto", back_populates="pedidos")

    cliente_nome = Column(Text, ForeignKey("clientes.nome"))
    cliente = relationship("Cliente", back_populates="pedidos")

class Cliente(Base):
    __tablename__ = "clientes"

    num = Column(Integer, primary_key=True)
    nome = Column(Text, nullable=False, unique=True)
    idade = Column(Integer)
    telefone = Column(Text, nullable=False)
    email = Column(Text)

    pedidos = relationship("Pedido", back_populates="cliente", cascade="all, delete")

class Produto(Base):
    __tablename__ = "produtos"

    num = Column(Integer, primary_key=True)
    nome = Column(Text, nullable=False, unique=True)
    descricao = Column(Text)
    valor = Column(DECIMAL, nullable=False)
    categoria = Column(Text)

    pedidos = relationship("Pedido", back_populates="produtos")