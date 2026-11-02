from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert, Patient, User
from app.schemas import AlertCreate, AlertForStaff, AlertOut
from app.security import get_current_user, require_roles
from app.services.alert_service import close_alert, create_alert, mark_received, take_charge
from app.routes.suivi import current_patient

router = APIRouter()
staff_only = require_roles("medecin", "centre", "admin")


def for_staff(alert: Alert) -> AlertForStaff:
    p = alert.patient
    return AlertForStaff(
        **AlertOut.model_validate(alert).model_dump(),
        patient_name=p.user.full_name,
        patient_phone=p.user.phone,
        cancer_type=p.cancer_type,
        treatment=p.treatment,
    )


def staff_can_see(alert: Alert, user: User) -> bool:
    p = alert.patient
    return (
        user.role == "admin"
        or p.doctor_id == user.id
        or (user.role == "centre" and user.centre_id in (p.centre_id, alert.escalated_centre_id))
    )


@router.post("/", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
def send_alert(data: AlertCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("patient"))):
    patient = current_patient(db, user)
    return create_alert(db, patient, data.type, data.symptom, data.latitude, data.longitude)


@router.get("/", response_model=list[AlertForStaff])
def list_alerts(statut: str | None = None, db: Session = Depends(get_db), user: User = Depends(staff_only)):
    query = db.query(Alert).join(Patient)
    if statut:
        query = query.filter(Alert.status == statut)
    alerts = [a for a in query.order_by(Alert.created_at.desc()).all() if staff_can_see(a, user)]
    return [for_staff(a) for a in alerts]


@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerte introuvable.")
    if user.role == "patient":
        if alert.patient.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
        return alert
    if not staff_can_see(alert, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
    mark_received(db, alert, user.full_name)
    return for_staff(alert)


def staff_alert(db: Session, alert_id: int, user: User) -> Alert:
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerte introuvable.")
    if not staff_can_see(alert, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
    return alert


@router.post("/{alert_id}/prise-en-charge", response_model=AlertForStaff)
def handle(alert_id: int, db: Session = Depends(get_db), user: User = Depends(staff_only)):
    alert = staff_alert(db, alert_id, user)
    take_charge(db, alert, user)
    db.refresh(alert)
    return for_staff(alert)


@router.post("/{alert_id}/cloture", response_model=AlertForStaff)
def close(alert_id: int, db: Session = Depends(get_db), user: User = Depends(staff_only)):
    alert = staff_alert(db, alert_id, user)
    close_alert(db, alert, user)
    db.refresh(alert)
    return for_staff(alert)
