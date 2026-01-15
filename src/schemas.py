from datetime import datetime
from pydantic import BaseModel

class PedidoCreate(BaseModel):
    valor: float
    produtos_nomes: str
    cliente_nome: str

class PedidoResponse(BaseModel):
    num: int
    valor: float
    data: datetime
    produtos_nomes: str
    cliente_nome: str

    class ConfigDict:
        from_attributes = True

class ClienteCreate(BaseModel):
    nome: str
    idade: int | None
    telefone: str
    email: str | None

class ClienteResponse(BaseModel):
    num: int
    nome: str
    idade: int | None
    telefone: str
    email: str | None

    class ConfigDict:
        from_attributes = True

class ProdutoCreate(BaseModel):
    nome: str
    descricao: str | None
    valor: float
    categoria: str | None

class ProdutoResponse(BaseModel):
    num: int
    nome: str
    descricao: str | None
    valor: float
    categoria: str | None