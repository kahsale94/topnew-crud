from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas import PedidoCreate, PedidoResponse, PedidoUpdate, ItemPedidoResponse
from src.repositories.pedidos_repo import PedidoRepository

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])
repo = PedidoRepository()

@router.get("/", response_model=list[PedidoResponse])
def selecionar_pedidos(db: Session = Depends(get_db)):
    return repo.selecionar_pedidos(db)

@router.get("/{num}", response_model=list[ItemPedidoResponse])
def selecionar_items_pedido(num: int, db: Session = Depends(get_db)):
    return repo.selecionar_itens_pedido(db, num)

@router.post("/pedidos", response_model=PedidoResponse)
def criar_pedido(pedido: PedidoCreate, db: Session = Depends(get_db)):
    return repo.criar_pedido(db, pedido.cliente_nome, pedido.itens)

@router.put("/pedidos/{num}", response_model= PedidoResponse)
def atualizar_pedido(num: int, pedido: PedidoUpdate, db: Session = Depends(get_db)):
    atualizado = repo.atualizar_item_pedido(db, num, pedido.cliente_nome, pedido.item.produto_nome, pedido.item.valor_unitario, pedido.item.quantidade)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return atualizado

@router.delete("/pedidos/{num}")
def excluir_pedido(num: int, db: Session = Depends(get_db)):
    if not repo.excluir_pedido(db, num):
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return {"message": "Pedido removido"}