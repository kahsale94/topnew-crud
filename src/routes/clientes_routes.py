from fastapi import APIRouter, HTTPException, Depends
from src.database import db_dependecy
from src.schemas import ClienteCreate, ClienteResponse, ClienteUpdate
from src.repositories.clientes_repo import ClienteRepository
from src.security.security import Security

router = APIRouter(prefix="/clientes", tags=["Clientes"], dependencies=[Depends(Security.get_current_user)])
repo = ClienteRepository()

@router.get("/", response_model=list[ClienteResponse])
def selecionar_todos(db: db_dependecy):
    return repo.selecionar_todos(db)

@router.get("/{num}", response_model=ClienteResponse)
def selecionar_cliente(num: int, db: db_dependecy):
    return repo.selecionar_cliente(db, num)

@router.post("/clientes", response_model=ClienteResponse)
def criar_cliente(cliente: ClienteCreate, db: db_dependecy):
    return repo.criar_cliente(db, cliente.nome, cliente.telefone, cliente.endereco)

@router.put("/clientes/{num}", response_model=ClienteResponse)
def atualizar_cliente(num: int, cliente: ClienteUpdate, db: db_dependecy):
    atualizado = repo.atualizar_cliente(db, num, cliente.nome, cliente.telefone, cliente.endereco)
    if atualizado is False:
        raise HTTPException(status_code=404, detail="Cliente ja cadastrado!")
    if not atualizado:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return atualizado

@router.delete("/clientes/{num}")
def excluir_cliente(num: int, db: db_dependecy):
    if not repo.excluir_cliente(db, num):
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return {"message": "Cliente removido"}
