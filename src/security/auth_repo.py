from sqlalchemy.orm import Session
from src.models import Usuario
from src.security.security import Security

class AuthService:

    @staticmethod
    def login(db: Session, email: str, senha: str):
        usuario = db.query(Usuario).filter(Usuario.email == email).first()

        if not usuario:
            raise ValueError("Credenciais inválidas")

        if not Security.verificar_senha(senha, usuario.senha_hash):
            raise ValueError("Credenciais inválidas")

        access_token = Security.criar_access_token(usuario.id)
        refresh_token = Security.criar_refresh_token(usuario.id)

        return access_token, refresh_token