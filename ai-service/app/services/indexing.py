from sqlalchemy.orm import Session

from app.models import Document, Embedding
from app.services.embeddings import embed, model_name
from app.services.text import chunk


def index_document(db: Session, document: Document) -> int:
    db.query(Embedding).filter(Embedding.document_id == document.id).delete()
    text = "\n\n".join(p for p in [document.title, document.summary or "", document.content] if p)
    parts = chunk(text)
    vectors = embed(parts) if parts else []
    for i, (part, vector) in enumerate(zip(parts, vectors)):
        db.add(Embedding(document_id=document.id, chunk_index=i, content=part, vector=vector, model=model_name()))
    db.commit()
    return len(parts)
