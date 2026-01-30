from fastapi import APIRouter, HTTPException, Depends
from src.database import db_dependecy
from src.schemas import ProdutoCreate, ProdutoResponse, ProdutoUpdate
from src.repositories.produtos_repo import ProdutoRepository
from src.security.security import Security

router = APIRouter(prefix="/produtos", tags=["Produtos"], dependencies=[Depends(Security.get_current_user)])
repo = ProdutoRepository()

@router.get("/", response_model=list[ProdutoResponse])
def selecionar_todos(db: db_dependecy):
    return repo.selecionar_todos(db)

@router.get("/{num}", response_model=ProdutoResponse)
def selecionar_produto(num: int, db: db_dependecy):
    return repo.selecionar_produto(db, num)

@router.post("/produtos", response_model=ProdutoResponse)
def criar_produto(produto: ProdutoCreate, db: db_dependecy):
    return repo.criar_produto(db, produto.nome, produto.descricao, produto.valor_compra, produto.valor_venda, produto.categoria)

@router.put("/produtos/{num}", response_model= ProdutoResponse)
def atualizar_produto(num: int, produto: ProdutoUpdate, db: db_dependecy):
    atualizado = repo.atualizar_produto(db, num, produto.nome, produto.descricao, produto.valor_compra, produto.valor_venda, produto.categoria)
    if atualizado is False:
        raise HTTPException(status_code=404, detail="Produto ja cadastrado!")
    if not atualizado:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return atualizado

@router.delete("/produtos/{num}")
def excluir_produto(num: int, db: db_dependecy):
    if not repo.excluir_produto(db, num):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"message": "Produto removido"}