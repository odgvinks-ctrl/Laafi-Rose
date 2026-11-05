from typing import Literal, Optional

from pydantic import BaseModel, Field


class LoginIn(BaseModel):
    phone: str
    password: str


class RegisterIn(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=8)
    first_name: str = Field(min_length=1, max_length=60)
    last_name: Optional[str] = None
    city: Optional[str] = None
    language: Literal["fr", "mo", "dy"] = "fr"


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
