import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
ENVIRONMENT = os.getenv("ENVIRONMENT")
N8N_URL = os.getenv("N8N_URL")
N8N_KEY = os.getenv("N8N_KEY")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

TRUSTED_PROXY_HEADERS = os.getenv("TRUSTED_PROXY_HEADERS", "true").lower() == "true"

RATE_LIMIT_PUBLIC_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_PUBLIC_MAX_REQUESTS", "300"))
RATE_LIMIT_API_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_API_MAX_REQUESTS", "120"))
RATE_LIMIT_AUTH_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_AUTH_MAX_REQUESTS", "10"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))