from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas import ClienteCreate, ClienteResponse
from src.repositories.clientes_repo import ClienteRepository
from src.models import Cliente

router = APIRouter(prefix="/clientes", tags=["Clientes"])
repo = ClienteRepository()

@router.get("/")
def home():
    return {"message": "API funcionando"}

@router.get("/clientes", response_model=list[ClienteResponse])
def select_all(db: Session = Depends(get_db)):
    return repo.select_all(db)

@router.post("/clientes", response_model=ClienteResponse)
def criar_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    return repo.criar_cliente(db, cliente.nome, cliente.idade, cliente.telefone, cliente.email)