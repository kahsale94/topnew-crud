import time
from collections import defaultdict

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from src.config import (
    TRUSTED_PROXY_HEADERS,
    RATE_LIMIT_PUBLIC_MAX_REQUESTS,
    RATE_LIMIT_API_MAX_REQUESTS,
    RATE_LIMIT_AUTH_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_SECONDS,
)

SUSPICIOUS_PATHS = {
    "/.env",
    "/.git/config",
    "/.git/HEAD",
    "/wp-admin",
    "/wp-login.php",
    "/xmlrpc.php",
    "/phpmyadmin",
    "/config.php",
    "/backup.zip",
    "/dump.sql",
}

def get_client_ip(request: Request) -> str:
    if TRUSTED_PROXY_HEADERS:
        cf_ip = request.headers.get("CF-Connecting-IP")
        if cf_ip:
            return cf_ip.strip()

        x_forwarded_for = request.headers.get("X-Forwarded-For")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()

        x_real_ip = request.headers.get("X-Real-IP")
        if x_real_ip:
            return x_real_ip.strip()

    if request.client:
        return request.client.host

    return "unknown"

class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        process_time = round((time.time() - start_time) * 1000, 2)

        client_ip = get_client_ip(request)
        proxy_ip = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")
        cf_ray = request.headers.get("CF-Ray")

        print(
            f"Request: {request.method} {request.url.path}\n"
            f"Status: {response.status_code}\n"
            f"Time: {process_time}ms\n"
            f"Client-IP: {client_ip}\n"
            f"Proxy-IP: {proxy_ip}\n"
            f"User-Agent: {user_agent}\n"
            f"CF-Ray: {cf_ray}"
        )

        return response

class RateLimitMiddleware(BaseHTTPMiddleware):

    def __init__(self, app):
        super().__init__(app)
        self.clients = defaultdict(list)

    def get_limit_for_request(self, request: Request) -> tuple[int, int]:
        path = request.url.path

        if path.startswith("/auth/login") or path.startswith("/auth/refresh"):
            return RATE_LIMIT_AUTH_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS

        if (
            path.startswith("/clientes")
            or path.startswith("/produtos")
            or path.startswith("/pedidos")
            or path.startswith("/estoque")
            or path.startswith("/usuarios")
        ):
            return RATE_LIMIT_API_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS

        return RATE_LIMIT_PUBLIC_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if path in SUSPICIOUS_PATHS:
            return JSONResponse(
                status_code=404,
                content={"detail": "Not found"},
            )

        if path.startswith("/static/"):
            return await call_next(request)

        client_ip = get_client_ip(request)
        current_time = time.time()

        max_requests, window = self.get_limit_for_request(request)

        rate_limit_key = f"{client_ip}:{request.method}:{path}"

        request_times = self.clients[rate_limit_key]

        self.clients[rate_limit_key] = [
            request_time
            for request_time in request_times
            if current_time - request_time < window
        ]

        if len(self.clients[rate_limit_key]) >= max_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"},
                headers={"Retry-After": str(window)},
            )

        self.clients[rate_limit_key].append(current_time)

        return await call_next(request)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        return response

class NoCacheStaticFilesMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.url.path.startswith("/static/") or request.url.path.endswith(".html"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        return response