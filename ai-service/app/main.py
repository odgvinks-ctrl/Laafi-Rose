from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.core.database import init_db
from app.routes import articles, chat, documents, logs

init_db()

app = FastAPI(title="Laafi Rose · Service IA", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router, prefix="/articles", tags=["Articles (application)"])
app.include_router(chat.router, prefix="/chat", tags=["Assistant"])
app.include_router(documents.router, prefix="/documents", tags=["Documents (administration)"])
app.include_router(logs.router, prefix="/logs", tags=["Journal IA (administration)"])


@app.get("/health")
def health():
    return {"status": "ok"}
