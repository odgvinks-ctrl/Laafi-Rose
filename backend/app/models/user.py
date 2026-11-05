from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base, now


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True)
    password_hash = Column(Text, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    health_center_id = Column(Integer, ForeignKey("health_centers.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)
    last_login_at = Column(DateTime)

    role = relationship("Role", back_populates="users")
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    health_center = relationship("HealthCenter", back_populates="staff")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="user")
