import requests
from fastapi import APIRouter
from src.schemas.n8n_schema import N8NCreate
from src.config import N8N_URL, N8N_KEY

router = APIRouter(prefix="/n8n", tags=["N8N"])

@router.post("/enviar", status_code=201)
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
        }
    )

    return response.json()