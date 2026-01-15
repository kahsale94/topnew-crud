from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.schemas import ProdutoCreate, ProdutoResponse
from src.repositories.produtos_repo import ProdutoRepository
from src.models import Produto

router = APIRouter(prefix="/produtos", tags=["Produtos"])
repo = ProdutoRepository()

@router.get("/")
def home():
    return {"message": "API funcionando"}

@router.get("/produtos", response_model=list[ProdutoResponse])
def select_all(db: Session = Depends(get_db)):
    return repo.select_all(db)

@router.post("/produtos", response_model=ProdutoResponse)
def criar_produto(produto: ProdutoCreate, db: Session = Depends(get_db)):
    return repo.criar_produto(db, produto.nome, produto.descricao, produto.valor, produto.categoria)