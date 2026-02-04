from datetime import datetime
from pydantic import BaseModel

class EstoqueResponse(BaseModel):
    num_produto: int
    nome_produto: str
    ultima_atualizacao: datetime
    estoque_atual: int
    estoque_minimo: int

    class ConfigDict:
        from_attributes = True

class EstoqueUpdate(BaseModel):
    estoque_atual: int | None = None
    estoque_minimo: int | None = None