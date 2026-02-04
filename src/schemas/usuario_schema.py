from pydantic import BaseModel

class UsuarioCreate(BaseModel):
    email: str
    senha: str

class UsuarioResponse(BaseModel):
    id: int
    email: str

    class ConfigDict:
        from_attributes = True