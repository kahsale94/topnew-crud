from fastapi import APIRouter, HTTPException, Depends
from src.database import db_dependecy
from src.schemas.cliente_schema import ClienteCreate, ClienteResponse, ClienteUpdate
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

@router.post("/clientes", status_code=201, response_model=ClienteResponse)
def criar_cliente(cliente: ClienteCreate, db: db_dependecy):
    novo_cliente = repo.criar_cliente(db, cliente.nome, cliente.telefone, cliente.endereco)
    if not novo_cliente:
        raise HTTPException(status_code=409, detail="Cliente já cadastrado!")
    return novo_cliente

@router.put("/clientes/{num}", response_model=ClienteResponse)
def atualizar_cliente(num: int, cliente: ClienteUpdate, db: db_dependecy):
    atualizado = repo.atualizar_cliente(db, num, cliente.nome, cliente.telefone, cliente.endereco)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Cliente não encontrado!")
    if atualizado == "telefone_duplicado":
        raise HTTPException(status_code=409, detail="Telefone já cadastrado!")
    if atualizado == "nome_duplicado":
        raise HTTPException(status_code=409, detail="Cliente já cadastrado!")
    return atualizado

@router.delete("/clientes/{num}", status_code=204)
def excluir_cliente(num: int, db: db_dependecy):
    deletado = repo.excluir_cliente(db, num)
    if not deletado:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return
