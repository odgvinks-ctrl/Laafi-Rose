from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import Orm


class RoleOut(Orm):
    id: int
    code: str
    label: str


class ProfileOut(Orm):
    first_name: str
    last_name: Optional[str]
    gender: Optional[str]
    birth_year: Optional[int]
    city: Optional[str]
    language: str
    text_size: str
    avatar_url: Optional[str]


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[Literal["femme", "homme", "autre"]] = None
    birth_year: Optional[int] = Field(default=None, ge=1900, le=2030)
    city: Optional[str] = None
    language: Optional[Literal["fr", "mo", "dy"]] = None
    text_size: Optional[Literal["standard", "grand", "tres_grand"]] = None
    avatar_url: Optional[str] = None


class UserOut(Orm):
    id: int
    phone: str
    email: Optional[str]
    role: RoleOut
    health_center_id: Optional[int]
    profile: Optional[ProfileOut]
    created_at: datetime


class StaffCreate(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=8)
    first_name: str
    last_name: Optional[str] = None
    role: Literal["soignant", "centre", "admin"]
    health_center_id: Optional[int] = None
