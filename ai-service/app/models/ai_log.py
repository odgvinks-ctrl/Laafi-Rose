from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.core.database import Base, now


class AiLog(Base):
    __tablename__ = "ai_logs"

    id = Column(Integer, primary_key=True)
    session_id = Column(String(36), index=True)
    message_id = Column(Integer)
    event = Column(String(30), nullable=False)
    provider = Column(String(30))
    model = Column(String(80))
    latency_ms = Column(Integer)
    top_score = Column(Float)
    detail = Column(Text)
    created_at = Column(DateTime, default=now)
