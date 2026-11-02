from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Reminder
from app.schemas import ReminderCreate, ReminderOut
from app.services.reminder_service import next_date

router = APIRouter()


@router.post("/", response_model=ReminderOut, status_code=status.HTTP_201_CREATED)
def subscribe(data: ReminderCreate, db: Session = Depends(get_db)):
    reminder = Reminder(**data.model_dump())
    reminder.phone = reminder.phone.replace(" ", "")
    reminder.next_at = next_date(reminder)
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsubscribe(reminder_id: int, phone: str, db: Session = Depends(get_db)):
    reminder = db.get(Reminder, reminder_id)
    if not reminder or reminder.phone != phone.replace(" ", ""):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rappel introuvable.")
    reminder.active = False
    db.commit()
