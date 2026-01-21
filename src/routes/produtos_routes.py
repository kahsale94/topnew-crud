from fastapi import APIRouter, HTTPException
from src.database import db_dependecy
from src.schemas import ProdutoCreate, ProdutoResponse, ProdutoUpdate
from src.repositories.produtos_repo import ProdutoRepository

router = APIRouter(prefix="/produtos", tags=["Produtos"])
repo = ProdutoRepository()

@router.get("/", response_model=list[ProdutoResponse])
def selecionar_todos(db: db_dependecy):
    return repo.selecionar_todos(db)

@router.get("/{num}", response_model=ProdutoResponse)
def selecionar_produto(num: int, db: db_dependecy):
    return repo.selecionar_produto(db, num)

@router.post("/produtos", response_model=ProdutoResponse)
def criar_produto(produto: ProdutoCreate, db: db_dependecy):
    return repo.criar_produto(db, produto.nome, produto.descricao, produto.valor, produto.categoria)

@router.put("/produtos/{num}", response_model= ProdutoResponse)
def atualizar_produto(num: int, produto: ProdutoUpdate, db: db_dependecy):
    atualizado = repo.atualizar_produto(db, num, produto.nome, produto.descricao, produto.valor, produto.categoria)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return atualizado

@router.delete("/produtos/{num}")
def excluir_produto(num: int, db: db_dependecy):
    if not repo.excluir_produto(db, num):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"message": "Produto removido"}