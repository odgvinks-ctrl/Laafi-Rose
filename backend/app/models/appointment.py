from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base, now


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True)
    reference = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    health_center_id = Column(Integer, ForeignKey("health_centers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"))
    desired_at = Column(DateTime)
    confirmed_at = Column(DateTime)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    contact_method = Column(String(10), default="appel")
    language = Column(String(5), default="fr")
    status = Column(String(20), default="en_attente")
    staff_note = Column(Text)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    user = relationship("User", back_populates="appointments")
    health_center = relationship("HealthCenter", back_populates="appointments")
    service = relationship("Service")
