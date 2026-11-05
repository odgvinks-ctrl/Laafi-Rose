from sqlalchemy.orm import Session

from app.core.config import IS_POSTGRES, RETRIEVAL_MIN_SCORE, RETRIEVAL_TOP_K
from app.models import Document, Embedding
from app.services.embeddings import cosine, embed


def search(db: Session, question: str, k: int = RETRIEVAL_TOP_K) -> list[tuple[Embedding, float]]:
    query_vector = embed([question])[0]
    base = db.query(Embedding).join(Document).filter(Document.status == "publie")
    if IS_POSTGRES:
        distance = Embedding.vector.cosine_distance(query_vector)
        rows = base.add_columns(distance).order_by(distance).limit(k).all()
        scored = [(e, 1 - d) for e, d in rows]
    else:
        scored = sorted(((e, cosine(query_vector, e.vector)) for e in base.all()), key=lambda x: -x[1])[:k]
    return [(e, s) for e, s in scored if s >= RETRIEVAL_MIN_SCORE]
