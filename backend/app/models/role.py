from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    code = Column(String(30), unique=True, nullable=False)
    label = Column(String(80), nullable=False)

    users = relationship("User", back_populates="role")
