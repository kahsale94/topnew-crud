from sqlalchemy import Column, Integer, DECIMAL, Text, TIMESTAMP, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from src.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    email = Column(Text, nullable=False, unique=True)
    senha_hash = Column(Text, nullable=False)

class Pedido(Base):
    __tablename__ = "pedidos"

    num = Column(Integer, primary_key=True)
    num_cliente = Column(Integer, ForeignKey("clientes.num"), nullable=False)
    valor = Column(DECIMAL, nullable=False)
    forma_pagamento = Column(Text)
    pago = Column(Boolean, default=False)
    data = Column(TIMESTAMP, default=func.now())

    item_pedido = relationship("ItemPedido", back_populates="pedidos", cascade="all, delete")
    cliente = relationship("Cliente", back_populates="pedidos")

class ItemPedido(Base):
    __tablename__ = "itens_pedido"

    num = Column(Integer, primary_key=True) 
    num_pedido = Column(Integer, ForeignKey("pedidos.num"), nullable=False)
    num_produto = Column(Integer, ForeignKey("produtos.num"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    valor_unitario = Column(DECIMAL, nullable=False)

    produto = relationship("Produto", back_populates="pedidos")
    pedidos = relationship("Pedido", back_populates="item_pedido")

class Cliente(Base):
    __tablename__ = "clientes"

    num = Column(Integer, primary_key=True)
    nome = Column(Text, nullable=False, unique=True)
    telefone = Column(Text, nullable=False, unique=True)
    endereco = Column(Text, nullable=False, unique=True)

    pedidos = relationship("Pedido", back_populates="cliente", cascade="all, delete")

class Produto(Base):
    __tablename__ = "produtos"

    num = Column(Integer, primary_key=True)
    nome = Column(Text, nullable=False, unique=True)
    descricao = Column(Text)
    valor_compra = Column(DECIMAL, nullable=False)
    valor_venda = Column(DECIMAL, nullable=False)
    categoria = Column(Text)

    pedidos = relationship("ItemPedido", back_populates="produto")