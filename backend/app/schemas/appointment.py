from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import Orm


class AppointmentIn(BaseModel):
    health_center_id: int
    service_id: Optional[int] = None
    desired_at: Optional[datetime] = None
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=8, max_length=20)
    contact_method: Literal["appel", "sms"] = "appel"
    language: Literal["fr", "mo", "dy"] = "fr"
    consent: bool


class AppointmentStatusIn(BaseModel):
    status: Literal["en_attente", "confirme", "annule", "honore", "absent"]
    confirmed_at: Optional[datetime] = None
    staff_note: Optional[str] = None


class AppointmentOut(Orm):
    id: int
    reference: str
    health_center_id: int
    service_id: Optional[int]
    desired_at: Optional[datetime]
    confirmed_at: Optional[datetime]
    status: str
    name: str
    phone: str
    contact_method: str
    language: str
    created_at: datetime
