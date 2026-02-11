from fastapi import APIRouter, HTTPException, Depends
from src.database import db_dependecy
from src.schemas.produto_schema import ProdutoCreate, ProdutoResponse, ProdutoUpdate
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

@router.post("/produtos", status_code=201, response_model=ProdutoResponse)
def criar_produto(produto: ProdutoCreate, db: db_dependecy):
    novo_produto =  repo.criar_produto(db, produto.nome, produto.descricao, produto.valor_compra, produto.valor_venda, produto.categoria)
    if not novo_produto:
        raise HTTPException(status_code=409, detail="Produto ja cadastrado!")
    return novo_produto

@router.put("/produtos/{num}", response_model= ProdutoResponse)
def atualizar_produto(num: int, produto: ProdutoUpdate, db: db_dependecy):
    atualizado = repo.atualizar_produto(db, num, produto.nome, produto.descricao, produto.valor_compra, produto.valor_venda, produto.categoria)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Produto não encontrado!")
    if atualizado == "duplicado":
        raise HTTPException(status_code=409, detail="Produto ja cadastrado!")
    return atualizado

@router.delete("/produtos/{num}", status_code=409)
def excluir_produto(num: int, db: db_dependecy):
    deletado = repo.excluir_produto(db, num)
    if not deletado:
        raise HTTPException(status_code=404, detail="Produto não encontrado!")
    return