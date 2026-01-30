from datetime import datetime
from pydantic import BaseModel
from typing import List

class UsuarioCreate(BaseModel):
    email: str
    senha: str

class UsuarioResponse(BaseModel):
    id: int
    email: str

    class ConfigDict:
        from_attributes = True

class ItemPedidoCreate(BaseModel):
    num_produto: int
    quantidade: int
    valor_unitario: float

class ItemPedidoUpdate(BaseModel):
    num_produto: int
    quantidade: int | None = None
    valor_unitario: float | None = None

class ItemPedidoResponse(BaseModel):
    num: int
    num_pedido: int
    num_produto: int
    nome_produto: str
    quantidade: int
    valor_unitario: float

    class ConfigDict:
        from_attributes = True

class PedidoCreate(BaseModel):
    num_cliente: int
    itens: List[ItemPedidoCreate]
    forma_pagamento: str
    pago: bool

class PedidoUpdate(BaseModel):
    item: ItemPedidoUpdate | None = None
    num_cliente: int | None = None
    forma_pagamento: str | None = None
    pago: bool | None = None

class PedidoResponse(BaseModel):
    num: int
    num_cliente: int
    nome_cliente: str
    valor: float
    forma_pagamento: str
    pago: bool
    data: datetime

    class ConfigDict:
        from_attributes = True

class ClienteCreate(BaseModel):
    nome: str
    telefone: str
    endereco: str

class ClienteUpdate(BaseModel):
    nome: str | None = None
    telefone: str | None = None
    endereco: str | None = None

class ClienteResponse(BaseModel):
    num: int
    nome: str
    telefone: str
    endereco: str

    class ConfigDict:
        from_attributes = True

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str | None = None
    valor_compra: float
    valor_venda: float
    categoria: str | None = None

class ProdutoUpdate(BaseModel):
    nome: str | None = None
    descricao: str | None = None
    valor_compra: float | None = None
    valor_venda: float | None = None
    categoria: str | None = None

class ProdutoResponse(BaseModel):
    num: int
    nome: str
    descricao: str | None = None
    valor_compra: float
    valor_venda: float
    categoria: str | None = None

    class ConfigDict:
        from_attributes = True