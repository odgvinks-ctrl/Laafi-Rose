from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db, now
from app.core.security import get_current_user
from app.models import Notification, User
from app.schemas.notification import NotificationOut

router = APIRouter()


@router.get("/", response_model=list[NotificationOut])
def list_notifications(unread_only: bool = False, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        query = query.filter(Notification.read_at.is_(None))
    return query.order_by(Notification.created_at.desc()).limit(100).all()


@router.post("/{notification_id}/lue", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    notification = db.get(Notification, notification_id)
    if not notification or notification.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification introuvable.")
    notification.read_at = notification.read_at or now()
    db.commit()
    db.refresh(notification)
    return notification


@router.post("/tout-lire", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.read_at.is_(None)).update({"read_at": now()})
    db.commit()


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    notification = db.get(Notification, notification_id)
    if not notification or notification.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification introuvable.")
    db.delete(notification)
    db.commit()
