from fastapi import APIRouter, Depends, HTTPException
from src.security.security import Security
from src.database import db_dependecy
from src.schemas.usuario_schema import UsuarioCreate, UsuarioResponse
from src.repositories.usuarios_repo import UsuarioRepository

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])
repo = UsuarioRepository()

@router.get("/me", response_model=UsuarioResponse)
def perfil(usuario = Depends(Security.get_current_user)):
    if usuario is None:
        raise HTTPException(status_code=401, detail="Falha na autenticacao!")
    return {
        "id": usuario.id,
        "email": usuario.email,
    }

@router.get("/usuarios", response_model=list[UsuarioResponse])
def selecionar_usuarios(db: db_dependecy):
    return repo.selecionar_usuarios(db)

@router.post("/usuarios", response_model=UsuarioResponse)
def criar_usuario(usuario: UsuarioCreate, db: db_dependecy):
    return repo.signup(db, usuario.email, usuario.senha)