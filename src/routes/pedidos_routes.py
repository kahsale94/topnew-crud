from fastapi import APIRouter, HTTPException
from src.database import db_dependecy
from src.schemas import PedidoCreate, PedidoResponse, PedidoUpdate, ItemPedidoResponse
from src.repositories.pedidos_repo import PedidoRepository

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])
repo = PedidoRepository()

@router.get("/", response_model=list[PedidoResponse])
def selecionar_pedidos(db: db_dependecy):
    return repo.selecionar_pedidos(db)

@router.get("/{num}", response_model=list[ItemPedidoResponse])
def selecionar_itens_pedido(num: int, db: db_dependecy):
    return repo.selecionar_itens_pedido(db, num)

@router.post("/pedidos", response_model=PedidoResponse)
def criar_pedido(pedido: PedidoCreate, db: db_dependecy):
    return repo.criar_pedido(db, pedido.cliente_nome, pedido.itens)

@router.put("/pedidos/{num}", response_model= PedidoResponse)
def atualizar_pedido(num: int, pedido: PedidoUpdate, db: db_dependecy):
    atualizado = repo.atualizar_item_pedido(db, num, pedido.cliente_nome, pedido.item.produto_nome, pedido.item.valor_unitario, pedido.item.quantidade)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return atualizado

@router.delete("/pedidos/{num}")
def excluir_pedido(num: int, db: db_dependecy):
    if not repo.excluir_pedido(db, num):
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return {"message": "Pedido removido"}