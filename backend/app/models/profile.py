from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base, now


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String(60), nullable=False)
    last_name = Column(String(60))
    gender = Column(String(10))
    birth_year = Column(Integer)
    city = Column(String(80))
    language = Column(String(5), default="fr")
    text_size = Column(String(15), default="standard")
    avatar_url = Column(String(255))
    updated_at = Column(DateTime, default=now, onupdate=now)

    user = relationship("User", back_populates="profile")
