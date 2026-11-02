from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Fiche, User
from app.schemas import FicheCreate, FicheOut, FicheUpdate
from app.security import require_roles
from app.utils import now

router = APIRouter()


@router.get("/", response_model=list[FicheOut])
def list_fiches(category: str | None = None, q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Fiche).filter(Fiche.is_published.is_(True))
    if category:
        query = query.filter(Fiche.category == category)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter((Fiche.title.ilike(like)) | (Fiche.keywords.ilike(like)) | (Fiche.summary.ilike(like)))
    return query.order_by(Fiche.title).all()


@router.get("/{slug}", response_model=FicheOut)
def get_fiche(slug: str, db: Session = Depends(get_db)):
    fiche = db.query(Fiche).filter(Fiche.slug == slug, Fiche.is_published.is_(True)).first()
    if not fiche:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche introuvable.")
    return fiche


@router.post("/", response_model=FicheOut, status_code=status.HTTP_201_CREATED)
def create_fiche(data: FicheCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    fiche = Fiche(**data.model_dump(), reviewed_at=now() if data.is_published else None)
    db.add(fiche)
    db.commit()
    db.refresh(fiche)
    return fiche


@router.patch("/{slug}", response_model=FicheOut)
def update_fiche(slug: str, data: FicheUpdate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    fiche = db.query(Fiche).filter(Fiche.slug == slug).first()
    if not fiche:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiche introuvable.")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(fiche, key, value)
    fiche.reviewed_at = now()
    db.commit()
    db.refresh(fiche)
    return fiche
