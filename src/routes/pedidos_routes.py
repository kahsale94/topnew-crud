from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas import PedidoCreate, PedidoResponse
from src.repositories.pedidos_repo import PedidoRepository
from src.models import Pedido

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])
repo = PedidoRepository()

@router.get("/")
def home():
    return {"message": "API funcionando"}

@router.get("/pedidos", response_model=list[PedidoResponse])
def select_all(db: Session = Depends(get_db)):
    return repo.select_all(db)

@router.post("/pedidos", response_model=PedidoResponse)
def criar_pedido(pedido: PedidoCreate, db: Session = Depends(get_db)):
    return repo.criar_pedido(db, pedido.valor, pedido.produtos_nomes, pedido.cliente_nome)