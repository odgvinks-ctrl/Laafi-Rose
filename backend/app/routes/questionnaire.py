from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Question
from app.schemas import QuestionOut

router = APIRouter()


@router.get("/", response_model=list[QuestionOut])
def list_questions(db: Session = Depends(get_db)):
    return db.query(Question).order_by(Question.position).all()
