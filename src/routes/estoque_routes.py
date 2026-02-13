from fastapi import APIRouter, HTTPException, Depends
from src.database import db_dependecy
from src.schemas.estoque_schema import EstoqueResponse, EstoqueUpdate
from src.repositories.estoque_repo import EstoqueRepository
from src.security.security import Security

router = APIRouter(prefix="/estoque", tags=["Estoque"], dependencies=[Depends(Security.get_current_user)])
repo = EstoqueRepository()

@router.get("/", response_model=list[EstoqueResponse])
def selecionar_estoque(db: db_dependecy):
    return repo.selecionar_estoque(db)

@router.put("/{num_produto}", response_model= EstoqueResponse)
def atualizar_estoque(num_produto: int, estoque: EstoqueUpdate, db: db_dependecy):
    atualizado = repo.atualizar_estoque(db, num_produto, estoque.estoque_atual, estoque.estoque_minimo)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Produto não encontrado no estoque!")
    return atualizado

@router.put("/{num_produto}/zerar")
def zerar_estoque(num_produto: int, db: db_dependecy):
    atualizado = repo.zerar_estoque(db, num_produto)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Produto não encontrado no estoque!")
    return HTTPException(status_code=200, detail="Estoque de produto zerado!")