from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Audio
from app.schemas import AudioOut

router = APIRouter()


@router.get("/", response_model=list[AudioOut])
def list_audios(language: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Audio)
    if language:
        query = query.filter(Audio.language == language)
    return query.all()


@router.get("/{audio_id}", response_model=AudioOut)
def get_audio(audio_id: int, db: Session = Depends(get_db)):
    audio = db.get(Audio, audio_id)
    if not audio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio introuvable.")
    return audio
