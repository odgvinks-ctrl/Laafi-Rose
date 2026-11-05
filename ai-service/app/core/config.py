import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "local")
EMBEDDING_API_URL = os.getenv("EMBEDDING_API_URL", "")
EMBEDDING_API_KEY = os.getenv("EMBEDDING_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "384"))

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "local")
LLM_API_URL = os.getenv("LLM_API_URL", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "")

RETRIEVAL_TOP_K = int(os.getenv("RETRIEVAL_TOP_K", "4"))
RETRIEVAL_MIN_SCORE = float(os.getenv("RETRIEVAL_MIN_SCORE", "0.15"))

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL est introuvable. Copiez .env.example en .env.")

IS_POSTGRES = DATABASE_URL.startswith("postgresql")
