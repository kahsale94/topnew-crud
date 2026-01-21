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
    produto_nome: str
    quantidade: int
    valor_unitario: float

class ItemPedidoUpdate(BaseModel):
    produto_nome: str | None = None
    quantidade: int | None = None
    valor_unitario: float | None = None

class ItemPedidoResponse(BaseModel):
    num_pedido: int
    num: int
    produto_nome: str
    quantidade: int
    valor_unitario: float

    class ConfigDict:
        from_attributes = True

class PedidoCreate(BaseModel):
    cliente_nome: str
    itens: List[ItemPedidoCreate]

class PedidoUpdate(BaseModel):
    cliente_nome: str | None = None
    item: ItemPedidoUpdate | None = None

class PedidoResponse(BaseModel):
    num: int
    valor: float
    cliente_nome: str
    data: datetime

    class ConfigDict:
        from_attributes = True

class ClienteCreate(BaseModel):
    nome: str
    idade: int | None = None
    telefone: str
    email: str | None = None

class ClienteUpdate(BaseModel):
    nome: str | None = None
    idade: int | None = None
    telefone: str | None = None
    email: str | None = None

class ClienteResponse(BaseModel):
    num: int
    nome: str
    idade: int
    telefone: str
    email: str

    class ConfigDict:
        from_attributes = True

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str | None = None
    valor: float
    categoria: str | None = None

class ProdutoUpdate(BaseModel):
    nome: str | None = None
    descricao: str | None = None
    valor: float | None = None
    categoria: str | None = None

class ProdutoResponse(BaseModel):
    num: int
    nome: str
    descricao: str
    valor: float
    categoria: str

    class ConfigDict:
        from_attributes = True