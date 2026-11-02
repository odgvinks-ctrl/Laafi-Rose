from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert, DailyCheck, Patient, TreatmentSession, User
from app.schemas import DailyCheckIn, DailyCheckOut, MySuiviOut
from app.security import require_roles
from app.services.alert_service import create_alert
from app.utils import now

router = APIRouter()


def current_patient(db: Session, user: User) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == user.id, Patient.is_active.is_(True)).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun suivi actif pour ce compte.")
    return patient


@router.get("/moi", response_model=MySuiviOut)
def my_follow_up(db: Session = Depends(get_db), user: User = Depends(require_roles("patient"))):
    patient = current_patient(db, user)
    sessions = (
        db.query(TreatmentSession)
        .filter(TreatmentSession.patient_id == patient.id, TreatmentSession.status == "prevue", TreatmentSession.scheduled_at >= now())
        .order_by(TreatmentSession.scheduled_at)
        .limit(5)
        .all()
    )
    alerts = db.query(Alert).filter(Alert.patient_id == patient.id, Alert.status != "cloturee").order_by(Alert.created_at.desc()).all()
    return MySuiviOut(
        patient=patient,
        doctor_name=patient.doctor.full_name,
        doctor_phone=patient.doctor.phone,
        centre_name=patient.centre.name,
        centre_phone=patient.centre.phone,
        next_sessions=sessions,
        open_alerts=alerts,
    )


@router.post("/etat-du-jour", response_model=DailyCheckOut, status_code=status.HTTP_201_CREATED)
def daily_check(data: DailyCheckIn, db: Session = Depends(get_db), user: User = Depends(require_roles("patient"))):
    patient = current_patient(db, user)
    if data.latitude is not None and data.longitude is not None:
        patient.last_latitude, patient.last_longitude = data.latitude, data.longitude
    serious = data.fever or data.bleeding or data.pain_level >= 8
    check = DailyCheck(
        patient_id=patient.id,
        fever=data.fever,
        bleeding=data.bleeding,
        pain_level=data.pain_level,
        note=data.note,
        triggered_alert=serious,
    )
    db.add(check)
    db.commit()
    db.refresh(check)
    if serious:
        signs = [s for s, on in (("fièvre", data.fever), ("saignement", data.bleeding), (f"douleur {data.pain_level}/10", data.pain_level >= 8)) if on]
        create_alert(db, patient, "symptome", symptom=", ".join(signs), latitude=data.latitude, longitude=data.longitude)
    return check


@router.post("/position", status_code=status.HTTP_204_NO_CONTENT)
def update_position(data: DailyCheckIn, db: Session = Depends(get_db), user: User = Depends(require_roles("patient"))):
    patient = current_patient(db, user)
    if not patient.share_location_continuously:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Le partage continu de la position n'est pas activé.")
    patient.last_latitude, patient.last_longitude = data.latitude, data.longitude
    db.commit()
