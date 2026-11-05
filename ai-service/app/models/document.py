from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base, now


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(30), nullable=False)
    summary = Column(Text)
    content = Column(Text, nullable=False)
    language = Column(String(5), default="fr")
    reading_minutes = Column(Integer, default=4)
    audio_urls = Column(Text, default="{}")
    status = Column(String(20), default="brouillon", index=True)
    reviewed_by = Column(String(120))
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    sources = relationship("Source", back_populates="document", cascade="all, delete-orphan")
    embeddings = relationship("Embedding", back_populates="document", cascade="all, delete-orphan")
