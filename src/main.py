from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.middlewares.auth_middleware import LoggingMiddleware, RateLimitMiddleware
from src.routes import pedidos_routes, clientes_routes, produtos_routes, usuarios_routes, estoque_routes, n8n_routes
from src.security import auth_routes

app = FastAPI(title="API de Pedidos")

app.add_middleware(CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=100, window=60)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(pedidos_routes.router)
app.include_router(clientes_routes.router)
app.include_router(produtos_routes.router)
app.include_router(usuarios_routes.router)
app.include_router(auth_routes.router)
app.include_router(estoque_routes.router)
app.include_router(n8n_routes.router)

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(request, "index.html")

@app.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse(request, "login.html")