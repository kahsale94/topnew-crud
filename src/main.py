from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.routes import pedidos_routes, clientes_routes, produtos_routes, usuarios_routes
from src.security import auth_routes

app = FastAPI(title="API de Pedidos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # durante desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(pedidos_routes.router)
app.include_router(clientes_routes.router)
app.include_router(produtos_routes.router)
app.include_router(usuarios_routes.router)
app.include_router(auth_routes.router)

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(request, "index.html")

