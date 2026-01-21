from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from src.routes import pedidos_routes, clientes_routes, produtos_routes, usuarios_routes
from src.security import auth_routes

app = FastAPI(title="API de Pedidos")

templates = Jinja2Templates(directory="templates")

app.include_router(pedidos_routes.router)
app.include_router(clientes_routes.router)
app.include_router(produtos_routes.router)
app.include_router(usuarios_routes.router)
app.include_router(auth_routes.router)

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(request, "index.html")