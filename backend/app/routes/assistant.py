from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import AssistantIn, AssistantOut
from app.services.assistant_service import answer

router = APIRouter()


@router.post("/", response_model=AssistantOut)
def ask(data: AssistantIn, db: Session = Depends(get_db)):
    return answer(db, data.question)
