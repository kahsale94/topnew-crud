import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        process_time = round((time.time() - start_time) * 1000, 2)

        print(f"Request: {request.method} {request.url.path}\nStatus: {response.status_code}\nTime: {process_time}ms")

        return response

class RateLimitMiddleware(BaseHTTPMiddleware):

    def __init__(self, app, max_requests: int = 100, window: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window = window
        self.clients = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()

        request_times = self.clients[client_ip]

        self.clients[client_ip] = [
            t for t in request_times if current_time - t < self.window
        ]

        if len(self.clients[client_ip]) >= self.max_requests:
            raise HTTPException(status_code=429, detail="Too many requests")

        self.clients[client_ip].append(current_time)

        response = await call_next(request)
        return response