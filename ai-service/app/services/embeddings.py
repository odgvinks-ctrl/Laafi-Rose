import hashlib
import math

import httpx

from app.core.config import EMBEDDING_API_KEY, EMBEDDING_API_URL, EMBEDDING_DIM, EMBEDDING_MODEL, EMBEDDING_PROVIDER
from app.services.text import tokens


def model_name() -> str:
    return EMBEDDING_MODEL if EMBEDDING_PROVIDER == "api" else f"local-hash-{EMBEDDING_DIM}"


def _local(text: str) -> list[float]:
    vector = [0.0] * EMBEDDING_DIM
    for token in tokens(text):
        h = int(hashlib.md5(token.encode()).hexdigest(), 16)
        vector[h % EMBEDDING_DIM] += 1.0 if (h >> 8) % 2 else -1.0
    norm = math.sqrt(sum(v * v for v in vector)) or 1.0
    return [v / norm for v in vector]


def embed(texts: list[str]) -> list[list[float]]:
    if EMBEDDING_PROVIDER != "api":
        return [_local(t) for t in texts]
    response = httpx.post(
        EMBEDDING_API_URL,
        headers={"Authorization": f"Bearer {EMBEDDING_API_KEY}"},
        json={"model": EMBEDDING_MODEL, "input": texts},
        timeout=30,
    )
    response.raise_for_status()
    return [item["embedding"] for item in response.json()["data"]]


def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a)) or 1.0
    nb = math.sqrt(sum(y * y for y in b)) or 1.0
    return dot / (na * nb)
