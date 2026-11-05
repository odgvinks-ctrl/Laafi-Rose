from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models import Appointment, HealthCenter, Service, User
from app.schemas.appointment import AppointmentIn, AppointmentOut, AppointmentStatusIn
from app.services.notification_service import notify, reference

router = APIRouter()
optional_token = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

STATUS_MESSAGES = {
    "confirme": "Votre rendez-vous est confirmé",
    "annule": "Votre demande de rendez-vous a été annulée",
}


def optional_user(token: str | None = Depends(optional_token), db: Session = Depends(get_db)) -> User | None:
    if not token:
        return None
    try:
        return get_current_user(token, db)
    except HTTPException:
        return None


@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def request_appointment(data: AppointmentIn, db: Session = Depends(get_db), user: User | None = Depends(optional_user)):
    if not data.consent:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Votre accord est nécessaire pour envoyer la demande.")
    center = db.get(HealthCenter, data.health_center_id)
    if not center or not center.accepts_appointments:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ce centre ne reçoit pas de demandes en ligne.")
    if data.service_id:
        service = db.get(Service, data.service_id)
        if not service or service.health_center_id != center.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ce service n'est pas proposé par ce centre.")
    values = data.model_dump(exclude={"consent"})
    values["phone"] = values["phone"].replace(" ", "")
    appointment = Appointment(reference=reference(), user_id=user.id if user else None, **values)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    for staff in center.staff:
        notify(db, staff.id, "rendez_vous", "Nouvelle demande de rendez-vous", f"{appointment.reference} · {appointment.name}", f"/rendez-vous/{appointment.reference}")
    return appointment


@router.get("/mes-demandes", response_model=list[AppointmentOut])
def my_appointments(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Appointment).filter(Appointment.user_id == user.id).order_by(Appointment.created_at.desc()).all()


@router.get("/centre/{center_id}", response_model=list[AppointmentOut])
def center_appointments(center_id: int, status_filter: str | None = None, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre", "soignant"))):
    if user.role.code != "admin" and user.health_center_id != center_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
    query = db.query(Appointment).filter(Appointment.health_center_id == center_id)
    if status_filter:
        query = query.filter(Appointment.status == status_filter)
    return query.order_by(Appointment.created_at.desc()).all()


@router.get("/{ref}", response_model=AppointmentOut)
def get_appointment(ref: str, phone: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.reference == ref).first()
    if not appointment or appointment.phone != phone.replace(" ", ""):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demande introuvable.")
    return appointment


@router.patch("/{ref}", response_model=AppointmentOut)
def update_status(ref: str, data: AppointmentStatusIn, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre", "soignant"))):
    appointment = db.query(Appointment).filter(Appointment.reference == ref).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demande introuvable.")
    if user.role.code != "admin" and user.health_center_id != appointment.health_center_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(appointment, key, value)
    db.commit()
    db.refresh(appointment)
    if data.status in STATUS_MESSAGES:
        notify(
            db,
            appointment.user_id,
            "rendez_vous",
            STATUS_MESSAGES[data.status],
            f"{appointment.health_center.name} · {appointment.reference}",
            f"/rendez-vous/{appointment.reference}",
            phone=appointment.phone,
        )
    return appointment
