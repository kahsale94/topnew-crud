from sqlalchemy.orm import Session
from src.models.cliente_model import Cliente

class ClienteRepository:

    def criar_cliente(self, db: Session, nome: str, telefone: int, endereco: str):

        existente = db.query(Cliente).filter(Cliente.nome == nome).first()
        if existente:
            return None

        cliente = Cliente(
            nome = nome,
            telefone = telefone,
            endereco = endereco
            )
        
        db.add(cliente)
        db.commit()
        db.refresh(cliente)

        return cliente

    def atualizar_cliente(self, db: Session, num: int, nome: str, telefone: int, endereco: str):

        cliente = db.query(Cliente).filter(Cliente.num == num).first()
        if not cliente:
            return None

        if nome is not None:
            existente = db.query(Cliente).filter(Cliente.nome == nome, Cliente.num != num).first()
            if existente:
                return "nome_duplicado"
            cliente.nome = nome

        if telefone is not None:
            existente = db.query(Cliente).filter(Cliente.telefone == telefone, Cliente.num != num).first()
            if existente:
                return "telefone_duplicado"
            cliente.telefone = telefone
            
        if endereco is not None:
            cliente.endereco = endereco

        db.commit()
        db.refresh(cliente)

        return cliente

    def excluir_cliente(self, db: Session, num: int):

        cliente = db.query(Cliente).filter(Cliente.num == num).first()
        if not cliente:
            return None
        
        db.delete(cliente)
        db.commit()

        return True

    def selecionar_cliente(self, db: Session, num: int):
        return db.query(Cliente).filter(Cliente.num == num).first()
    
    def selecionar_todos(self, db: Session):
        return db.query(Cliente).all()