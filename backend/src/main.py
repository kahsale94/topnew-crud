from fastapi import FastAPI, Request, Response
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from src.security import auth_routes
from src.config import ENVIRONMENT, ALLOWED_ORIGINS
from src.middlewares.auth_middleware import (
    LoggingMiddleware,
    RateLimitMiddleware,
    NoCacheStaticFilesMiddleware,
    SecurityHeadersMiddleware,
)
from src.routes import pedidos_routes, clientes_routes, produtos_routes, usuarios_routes, estoque_routes, n8n_routes

if ENVIRONMENT == "production":
    app = FastAPI(
        title="Logira API",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
else:
    app = FastAPI(title="Logira API")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS if ENVIRONMENT == "production" else ["*"],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(NoCacheStaticFilesMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

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

@app.get("/robots.txt")
def robots_txt():
    return Response(
        content="User-agent: *\nDisallow:\n",
        media_type="text/plain",
    )

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)