import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import current_user_id
from app.models import ChatSession
from app.schemas import MessageIn, MessageOut, SessionIn, SessionOut
from app.services.assistant import reply

router = APIRouter()


def get_session(db: Session, session_id: str, user_id: int | None) -> ChatSession:
    session = db.get(ChatSession, session_id)
    if not session or (session.user_id and session.user_id != user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation introuvable.")
    return session


@router.post("/sessions", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def start_session(data: SessionIn, db: Session = Depends(get_db), user_id: int | None = Depends(current_user_id)):
    session = ChatSession(id=str(uuid.uuid4()), user_id=user_id, language=data.language)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/{session_id}/messages", response_model=list[MessageOut])
def history(session_id: str, db: Session = Depends(get_db), user_id: int | None = Depends(current_user_id)):
    return get_session(db, session_id, user_id).messages


@router.post("/sessions/{session_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def ask(session_id: str, data: MessageIn, db: Session = Depends(get_db), user_id: int | None = Depends(current_user_id)):
    return reply(db, get_session(db, session_id, user_id), data.content.strip())


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str, db: Session = Depends(get_db), user_id: int | None = Depends(current_user_id)):
    db.delete(get_session(db, session_id, user_id))
    db.commit()
