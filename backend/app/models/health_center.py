from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base, now


class HealthCenter(Base):
    __tablename__ = "health_centers"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    type = Column(String(80))
    city = Column(String(80), index=True)
    district = Column(String(80))
    address = Column(Text)
    phone = Column(String(20))
    latitude = Column(Float)
    longitude = Column(Float)
    opening_hours = Column(Text)
    accepts_appointments = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    services = relationship("Service", back_populates="health_center", cascade="all, delete-orphan")
    staff = relationship("User", back_populates="health_center")
    appointments = relationship("Appointment", back_populates="health_center")
