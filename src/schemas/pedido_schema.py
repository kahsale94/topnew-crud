from datetime import datetime
from pydantic import BaseModel
from typing import List

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
    created_at: datetime
    updated_at: datetime

    class ConfigDict:
        from_attributes = True