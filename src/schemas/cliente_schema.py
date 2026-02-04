from pydantic import BaseModel

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