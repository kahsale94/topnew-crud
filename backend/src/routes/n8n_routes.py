import requests

from fastapi import APIRouter, Header, HTTPException, Depends

from src.config import N8N_URL, N8N_KEY
from src.schemas.n8n_schema import N8NCreate

router = APIRouter(prefix="/n8n", tags=["N8N"])

def validar_chave_interna(x_internal_secret: str | None = Header(default=None)):
    if not x_internal_secret or x_internal_secret != N8N_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.post("/enviar", status_code=201, dependencies=[Depends(validar_chave_interna)])
def enviar_pedido(dados: N8NCreate):

    itens_retorno = [
        {
            "nome_produto": item.nome_produto,
            "quantidade": item.quantidade,
            "valor_unitario": item.valor_unitario
        }
        for item in dados.itens
    ]

    data = {
        "num_pedido": dados.num_pedido,
        "nome_cliente": dados.nome_cliente,
        "telefone_cliente": dados.telefone_cliente,
        "itens": itens_retorno,
        "data": dados.data,
        "forma_pagamento": dados.forma_pagamento,
        "valor": dados.valor,
    }

    response = requests.post(
        N8N_URL,
        json=data,
        headers={
            "Content-Type": "application/json",
            "x-internal-secret": N8N_KEY
        },
        timeout=15,
    )

    response.raise_for_status()

    return response.json()