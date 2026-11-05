from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.config import EMBEDDING_DIM, IS_POSTGRES
from app.core.database import Base, now

if IS_POSTGRES:
    from pgvector.sqlalchemy import Vector

    VectorType = Vector(EMBEDDING_DIM)
else:
    VectorType = JSON


class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    vector = Column(VectorType, nullable=False)
    model = Column(String(80), nullable=False)
    created_at = Column(DateTime, default=now)

    document = relationship("Document", back_populates="embeddings")
