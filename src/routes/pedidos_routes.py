from fastapi import APIRouter, HTTPException, Depends
from src.database import db_dependecy
from src.schemas.pedido_schema import PedidoCreate, PedidoResponse, PedidoUpdate, ItemPedidoResponse
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

@router.post("/pedidos", status_code=201, response_model=PedidoResponse)
def criar_pedido(pedido: PedidoCreate, db: db_dependecy):
    novo_pedido = repo.criar_pedido(db, pedido.num_cliente, pedido.itens, pedido.forma_pagamento, pedido.pago)
    return novo_pedido

@router.put("/pedidos/{num_pedido}", response_model= PedidoResponse)
def atualizar_pedido(num_pedido: int, pedido: PedidoUpdate, db: db_dependecy):
    atualizado = repo.atualizar_pedido(db, num_pedido, pedido.num_cliente, pedido.forma_pagamento, pedido.pago)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Pedido não encontrado!")
    return atualizado

@router.put("/pedidos/{num_pedido}/{num_item}", response_model= PedidoResponse)
def atualizar_item_pedido(num_pedido: int, num_item: int, pedido: PedidoUpdate, db: db_dependecy):
    atualizado = repo.atualizar_item_pedido(db, num_pedido, num_item, pedido.item.num_produto, pedido.item.valor_unitario, pedido.item.quantidade)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Pedido não encontrado!")
    return atualizado

@router.delete("/pedidos/{num_pedido}/{num_item}", status_code=204)
def excluir_item_pedido(num_pedido: int, num_item: int, db: db_dependecy):
    item_deletado = repo.excluir_item_pedido(db, num_pedido, num_item)
    if not item_deletado:
        raise HTTPException(status_code=404, detail="Item não encontrado!")
    return

@router.delete("/pedidos/{num}", status_code=204)
def excluir_pedido(num: int, db: db_dependecy):
    pedido_deletado = repo.excluir_pedido(db, num)
    if not pedido_deletado:
        raise HTTPException(status_code=404, detail="Pedido não encontrado!")
    return