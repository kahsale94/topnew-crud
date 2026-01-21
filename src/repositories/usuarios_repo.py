from src.security.security import Security
from sqlalchemy.orm import Session
from src.models import Usuario

class UsuarioRepository:

    def signup(self, db: Session, email: str, senha: str):
        senha_hash = Security.gerar_hash(senha)

        usuario = Usuario(
            email = email,
            senha_hash = senha_hash
        )

        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        return usuario
    
    def selecionar_usuarios(self, db: Session):
        return db.query(Usuario).all()