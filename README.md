# 📋 Sistema de Gestão Comercial

Sistema web fullstack para gestão de clientes, produtos, estoque e pedidos, desenvolvido com FastAPI no backend e JavaScript puro no frontend.

O sistema conta com autenticação JWT, controle de acesso a rotas, persistência em PostgreSQL e integração com N8N para envio automatizado de pedidos via WhatsApp.

## 📈 Funcionalidades

- Criação, edição e envio de pedidos
- Cadastro e gerenciamento de clientes
- Cadastro e gerenciamento de produtos
- Controle de estoque
- Proteção de rotas
- Autenticação de usuários (JWT)

## 🛠️ Tecnologias

### 🗄️ Backend
- Python 3.13
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic (migrations)

### 🎨 Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)

### 🔧 Infraestrutura
- Docker
- Coolify (VPS Própria)

## 🏢 Organização do Projeto

### 🗃️ Estrutura

topnew-crud/
│
├── src/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── schemas/
│   ├── security/
│   ├── config.py
│   ├── database.py
│   └── main.py
├── static/
│   ├── app/
│   ├── core/
│   ├── pages/
│   ├── main.js
│   ├── styles.css
│   └── responsive.css
├── templates/
│   ├── index.html
│   └── login.html
├── workflows/
│   └── workflow.json
├── README.md
└── requirements.txt

### 🏗️ Arquitetura

O backend segue uma arquitetura em camadas:

- Routes → Camada HTTP
- Schemas → Validação de dados (Pydantic)
- Repositories → Acesso ao banco (SQLAlchemy)
- Security → Autenticação e controle de acesso

O frontend utiliza JavaScript modularizado com separação entre:

- Estado global
- Módulos de renderização
- Manipulação de eventos

## 🔀 Flow N8N

Esse fluxo em N8N foi criado para que os pedidos criados no sistema, possam ser enviados formalmente para os clientes via WhatsApp, ele é acionado atraves de um botão na coluna de "Ações" na aba "Pedidos".

### ⚙️ Como funciona

1. Recebe os dados via Webhook
2. Separa os necessarios via node "Data Handle"
3. Transforma as informacoes em variaveis e as monta em uma mensagem pronta atraves de um codigo em JavaScript
4. Envia o pedido para o numero de cadastro do cliente

### 🖥️ Workflow em execução

![Workflow em execução](workflows/demo.gif)

## 🚀 Como rodar projeto

### 1. Clonar repositório

```
git clone https://github.com/kahsale94/topnew-crud
cd topnew-crud
```

### 2. Criar ambiente virtual

```
python -m venv venv
source venv/bin/activate (Linux)
ou
.\venv\Scripts\activate (Windows)
```

### 3. Instalar dependências

```
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env`:
```
DATABASE_URL=postgresql://user:senha@localhost/sistema_dev
SECRET_KEY=sua_chave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

#### Variáveis utilizadas

| Variável | Descrição |
|----------|------------|
| DATABASE_URL | String de conexão com banco |
| SECRET_KEY | Chave para JWT |
| ALGORITHM | Algoritmo JWT |
| ACCESS_TOKEN_EXPIRE_MINUTES | Tempo de expiração do token de acesso |
| REFRESH_TOKEN_EXPIRE_DAYS | Tempo de expiração do token de refresh |

### 5. Ativar workflow N8N

1. Clone o repositório
2. No n8n, vá em **Import Workflow**
3. Importe o arquivo `workflow.json`
4. Configure as credenciais

### 6. Rodar aplicação

```
uvicorn main:app --reload
```

## 💭 Considerações

O sistema foi projetado para uso em pequena escala. Para cenários com alta concorrência e múltiplos usuários simultâneos, seria necessário:

- Implementar cache distribuído (ex: Redis)
- Utilizar filas para processamento assíncrono
- Escalar horizontalmente a aplicação

## 🔮 Próximos passos

- Refatorar frontend para React
- Implementar testes automatizados (pytest)
- Melhorar estratégia de logging
- Implementar CI/CD
- Aprimorar segurança (rate limiting, CORS refinado)
- Criar a parte de pré-atendimento automático (N8N)