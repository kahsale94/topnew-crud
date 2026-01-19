from sqlalchemy.orm import Session
from src.models import Cliente

class ClienteRepository:

    def criar_cliente(self, db: Session, nome: str, idade: int, telefone: int, email: str):
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

    def atualizar_cliente(self, db: Session, num: int, nome: str, idade: int, telefone: int, email: str):
        cliente = db.query(Cliente).filter(Cliente.num == num).first()
        if not cliente:
            return None
        
        if nome is not None:
            cliente.nome = nome
        if idade is not None:
            cliente.idade = idade
        if telefone is not None:
            cliente.telefone = telefone
        if email is not None:
            cliente.email = email

        db.commit()
        db.refresh(cliente)
        return cliente

    def excluir_cliente(self, db: Session, num: int):
        cliente = db.query(Cliente).filter(Cliente.num == num).first()
        if not cliente:
            return False
        
        db.delete(cliente)
        db.commit()
        return True

    def selecionar_cliente(self, db: Session, num: int):
        return db.query(Cliente).filter(Cliente.num == num).first()
    
    def selecionar_todos(self, db: Session):
        return db.query(Cliente).all()