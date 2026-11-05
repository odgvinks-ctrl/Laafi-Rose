from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base, now


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(40), nullable=False)
    title = Column(String(150), nullable=False)
    body = Column(Text)
    channel = Column(String(10), default="app")
    link = Column(String(255))
    read_at = Column(DateTime)
    created_at = Column(DateTime, default=now)

    user = relationship("User", back_populates="notifications")
