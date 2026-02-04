from sqlalchemy.orm import Session
from src.models.cliente_model import Cliente

class ClienteRepository:

    def criar_cliente(self, db: Session, nome: str, telefone: int, endereco: str):
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
            nomes_clientes = db.query(Cliente).filter(Cliente.num != num).all()
            for n in nomes_clientes:
                if nome == n.nome:
                    return False
            cliente.nome = nome
        if telefone is not None:
            cliente.telefone = telefone
        if endereco is not None:
            cliente.endereco = endereco

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