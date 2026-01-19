from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas import ClienteCreate, ClienteResponse, ClienteUpdate
from src.repositories.clientes_repo import ClienteRepository

router = APIRouter(prefix="/clientes", tags=["Clientes"])
repo = ClienteRepository()

@router.get("/", response_model=list[ClienteResponse])
def selecionar_todos(db: Session = Depends(get_db)):
    return repo.selecionar_todos(db)

@router.get("/{num}", response_model=ClienteResponse)
def selecionar_cliente(num: int, db: Session = Depends(get_db)):
    return repo.selecionar_cliente(db, num)

@router.post("/clientes", response_model=ClienteResponse)
def criar_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    return repo.criar_cliente(db, cliente.nome, cliente.idade, cliente.telefone, cliente.email)

@router.put("/clientes/{num}", response_model= ClienteResponse)
def atualizar_cliente(num: int, cliente: ClienteUpdate, db: Session = Depends(get_db)):
    atualizado = repo.atualizar_cliente(db, num, cliente.nome, cliente.idade, cliente.telefone, cliente.email)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return atualizado

@router.delete("/clientes/{num}")
def excluir_cliente(num: int, db: Session = Depends(get_db)):
    if not repo.excluir_cliente(db, num):
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return {"message": "Cliente removido"}
