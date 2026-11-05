from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.common import Orm


class ServiceIn(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    is_free: bool = False
    available: bool = True


class ServiceOut(Orm):
    id: int
    health_center_id: int
    name: str
    category: str
    description: Optional[str]
    is_free: bool
    available: bool


class HealthCenterIn(BaseModel):
    name: str
    type: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_hours: Optional[str] = None
    accepts_appointments: bool = False
    verified: bool = False


class HealthCenterUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_hours: Optional[str] = None
    accepts_appointments: Optional[bool] = None
    verified: Optional[bool] = None


class HealthCenterOut(Orm):
    id: int
    name: str
    type: Optional[str]
    city: Optional[str]
    district: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    opening_hours: Optional[str]
    accepts_appointments: bool
    verified: bool
    verified_at: Optional[datetime]
    updated_at: Optional[datetime]
    services: list[ServiceOut] = []
    distance_km: Optional[float] = None
