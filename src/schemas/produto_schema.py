from pydantic import BaseModel

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