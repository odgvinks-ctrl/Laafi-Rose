import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db, now
from app.core.security import require_admin
from app.models import Document, Source
from app.schemas import DocumentIn, DocumentOut, DocumentUpdate, PublishIn
from app.services.indexing import index_document

router = APIRouter(dependencies=[Depends(require_admin)])


def to_out(doc: Document) -> DocumentOut:
    out = DocumentOut.model_validate(doc)
    out.chunks = len(doc.embeddings)
    return out


def get_or_404(db: Session, slug: str) -> Document:
    doc = db.query(Document).filter(Document.slug == slug).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document introuvable.")
    return doc


@router.get("/", response_model=list[DocumentOut])
def list_documents(status_filter: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Document)
    if status_filter:
        query = query.filter(Document.status == status_filter)
    return [to_out(d) for d in query.order_by(Document.updated_at.desc()).all()]


@router.post("/", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def create_document(data: DocumentIn, db: Session = Depends(get_db)):
    if db.query(Document).filter(Document.slug == data.slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce slug existe déjà.")
    values = data.model_dump(exclude={"sources", "audio_urls"})
    doc = Document(**values, audio_urls=json.dumps(data.audio_urls))
    doc.sources = [Source(**s.model_dump()) for s in data.sources]
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return to_out(doc)


@router.patch("/{slug}", response_model=DocumentOut)
def update_document(slug: str, data: DocumentUpdate, db: Session = Depends(get_db)):
    doc = get_or_404(db, slug)
    values = data.model_dump(exclude_unset=True)
    if "sources" in values:
        doc.sources = [Source(**s) for s in values.pop("sources")]
    if "audio_urls" in values:
        doc.audio_urls = json.dumps(values.pop("audio_urls"))
    for key, value in values.items():
        setattr(doc, key, value)
    if doc.status == "publie":
        doc.status = "a_relire"
    db.commit()
    db.refresh(doc)
    return to_out(doc)


@router.post("/{slug}/publier", response_model=DocumentOut)
def publish(slug: str, data: PublishIn, db: Session = Depends(get_db)):
    doc = get_or_404(db, slug)
    if not doc.sources:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Un document doit citer au moins une source avant publication.")
    doc.status = "publie"
    doc.reviewed_by = data.reviewed_by
    doc.reviewed_at = now()
    db.commit()
    index_document(db, doc)
    db.refresh(doc)
    return to_out(doc)


@router.post("/{slug}/retirer", response_model=DocumentOut)
def unpublish(slug: str, db: Session = Depends(get_db)):
    doc = get_or_404(db, slug)
    doc.status = "retire"
    db.commit()
    db.refresh(doc)
    return to_out(doc)


@router.post("/reindexer")
def reindex_all(db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.status == "publie").all()
    return {"documents": len(docs), "extraits": sum(index_document(db, d) for d in docs)}
