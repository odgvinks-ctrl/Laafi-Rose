from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base, now


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True)
    user_id = Column(Integer, index=True)
    language = Column(String(5), default="fr")
    created_at = Column(DateTime, default=now)
    last_activity_at = Column(DateTime, default=now)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.id")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    sources = Column(JSON, default=list)
    document_slugs = Column(JSON, default=list)
    is_urgent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)

    session = relationship("ChatSession", back_populates="messages")
