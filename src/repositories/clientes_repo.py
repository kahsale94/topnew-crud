from sqlalchemy.orm import Session
from src.models import Cliente

class ClienteRepository:

    def criar_cliente(self, db: Session, nome: str, idade: int | None, telefone: int, email: str | None):
        cliente = Cliente(
            nome = nome,
            idade = idade,
            telefone = telefone,
            email = email
            )
        
        db.add(cliente)
        db.commit()
        db.refresh(cliente)
        return cliente

    def select_all(self, db: Session):
        return db.query(Cliente).all()