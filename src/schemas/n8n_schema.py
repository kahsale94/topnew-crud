from pydantic import BaseModel
from typing import List

class N8NItem(BaseModel):
    nome_produto: str
    quantidade: str
    valor_unitario: str

class N8NCreate(BaseModel):
    num_pedido: str
    nome_cliente: str
    telefone_cliente: str
    itens: List[N8NItem]
    data: str
    forma_pagamento: str
    valor: str