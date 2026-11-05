from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

Langue = Literal["fr", "mo", "dy"]


class Orm(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SourceIn(BaseModel):
    title: str
    organisation: Optional[str] = None
    url: Optional[str] = None
    year: Optional[int] = None


class SourceOut(Orm):
    title: str
    organisation: Optional[str]
    url: Optional[str]
    year: Optional[int]


class DocumentIn(BaseModel):
    slug: str
    title: str
    category: Literal["cancer", "facteur", "depistage", "prevention"]
    summary: Optional[str] = None
    content: str
    language: Langue = "fr"
    reading_minutes: int = 4
    audio_urls: dict[str, str] = {}
    sources: list[SourceIn] = []


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    reading_minutes: Optional[int] = None
    audio_urls: Optional[dict[str, str]] = None
    sources: Optional[list[SourceIn]] = None


class PublishIn(BaseModel):
    reviewed_by: str = Field(min_length=2)


class DocumentOut(Orm):
    id: int
    slug: str
    title: str
    category: str
    summary: Optional[str]
    status: str
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    updated_at: datetime
    chunks: int = 0


class ArticleOut(BaseModel):
    slug: str
    titre: str
    categorie: str
    resume: Optional[str]
    contenu: str
    langue: str
    lecture_minutes: int
    audios: dict[str, str]
    sources: list[SourceOut]
    revise_le: Optional[datetime]
    mis_a_jour_le: datetime


class SessionIn(BaseModel):
    language: Langue = "fr"


class SessionOut(Orm):
    id: str
    language: str
    created_at: datetime


class MessageIn(BaseModel):
    content: str = Field(min_length=2, max_length=800)


class MessageOut(Orm):
    id: int
    role: str
    content: str
    sources: list = []
    document_slugs: list = []
    is_urgent: bool
    created_at: datetime
