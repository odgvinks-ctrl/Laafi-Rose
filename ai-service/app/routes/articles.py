import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Document
from app.schemas import ArticleOut, SourceOut

router = APIRouter()


def to_article(doc: Document) -> ArticleOut:
    return ArticleOut(
        slug=doc.slug,
        titre=doc.title,
        categorie=doc.category,
        resume=doc.summary,
        contenu=doc.content,
        langue=doc.language,
        lecture_minutes=doc.reading_minutes,
        audios=json.loads(doc.audio_urls or "{}"),
        sources=[SourceOut.model_validate(s) for s in doc.sources],
        revise_le=doc.reviewed_at,
        mis_a_jour_le=doc.updated_at,
    )


@router.get("/", response_model=list[ArticleOut])
def list_articles(categorie: str | None = None, depuis: datetime | None = None, db: Session = Depends(get_db)):
    query = db.query(Document).filter(Document.status == "publie")
    if categorie:
        query = query.filter(Document.category == categorie)
    if depuis:
        query = query.filter(Document.updated_at >= depuis)
    return [to_article(d) for d in query.order_by(Document.title).all()]


@router.get("/retires", response_model=list[str])
def removed_articles(db: Session = Depends(get_db)):
    return [slug for (slug,) in db.query(Document.slug).filter(Document.status == "retire").all()]


@router.get("/{slug}", response_model=ArticleOut)
def get_article(slug: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.slug == slug, Document.status == "publie").first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article introuvable.")
    return to_article(doc)
