from fastapi import APIRouter, HTTPException, Depends
from src.database import db_dependecy
from src.schemas import PedidoCreate, PedidoResponse, PedidoUpdate, ItemPedidoResponse
from src.repositories.pedidos_repo import PedidoRepository
from src.security.security import Security

router = APIRouter(prefix="/pedidos", tags=["Pedidos"], dependencies=[Depends(Security.get_current_user)])
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

@router.put("/pedidos/{num_pedido}/{num_item}", response_model= PedidoResponse)
def atualizar_item_pedido(num_pedido: int, num_item: int, pedido: PedidoUpdate, db: db_dependecy):
    atualizado = repo.atualizar_item_pedido(db, num_pedido, num_item, pedido.item.num_produto, pedido.item.valor_unitario, pedido.item.quantidade)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return atualizado

@router.delete("/pedidos/{num_pedido}/{num_item}")
def excluir_item_pedido(num_pedido: int, num_item: int, db: db_dependecy):
    if not repo.excluir_item_pedido(db, num_pedido, num_item):
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return {"message": "Item removido"}

@router.delete("/pedidos/{num}")
def excluir_pedido(num: int, db: db_dependecy):
    if not repo.excluir_pedido(db, num):
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return {"message": "Pedido removido"}