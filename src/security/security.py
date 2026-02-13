from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from src.database import db_dependecy
from src.models import Usuario
from src.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Security:

    @staticmethod
    def gerar_hash(senha: str) -> str:
        return pwd_context.hash(senha)

    @staticmethod
    def verificar_senha(senha: str, senha_hash: str) -> bool:
        return pwd_context.verify(senha, senha_hash)

    @staticmethod
    def criar_access_token(user_id: int) -> str:
        payload = {
            "sub": str(user_id),
            "type": "access",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def criar_refresh_token(user_id: int) -> str:
        payload = {
            "sub": str(user_id),
            "type": "refresh",
            "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def get_current_user(db: db_dependecy, token: str = Depends(oauth2_scheme)) -> Usuario:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
            user_id = payload.get("sub")
            token_type = payload.get("type")
            if token_type != "access":
                raise HTTPException(status_code=401, detail="Token inválido para acesso")

            if user_id is None:
                raise HTTPException(status_code=401, detail="Token inválido")

        except JWTError:
            raise HTTPException(status_code=401, detail="Token inválido ou expirado")

        usuario = db.query(Usuario).filter(Usuario.id == int(user_id)).first()

        if not usuario:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")

        return usuario