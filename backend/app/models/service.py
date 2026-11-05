from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True)
    health_center_id = Column(Integer, ForeignKey("health_centers.id"), nullable=False)
    name = Column(String(120), nullable=False)
    category = Column(String(40), nullable=False)
    description = Column(Text)
    is_free = Column(Boolean, default=False)
    available = Column(Boolean, default=True)

    health_center = relationship("HealthCenter", back_populates="services")
