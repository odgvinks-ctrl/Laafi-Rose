from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Patient, TreatmentSession, User
from app.schemas import PatientCreate, PatientCreated, PatientOut, SessionCreate, SessionOut, SessionStatusIn
from app.security import hash_password, require_roles
from app.services.alert_service import create_alert
from app.services.sms_service import send_sms
from app.utils import now, temporary_password

router = APIRouter()
staff_only = require_roles("medecin", "centre", "admin")


def get_patient_for_staff(db: Session, patient_id: int, user: User) -> Patient:
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient introuvable.")
    allowed = user.role == "admin" or patient.doctor_id == user.id or (user.role == "centre" and patient.centre_id == user.centre_id)
    if not allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ce patient n'est pas suivi par votre équipe.")
    return patient


@router.post("/", response_model=PatientCreated, status_code=status.HTTP_201_CREATED)
def enroll_patient(data: PatientCreate, db: Session = Depends(get_db), doctor: User = Depends(require_roles("medecin"))):
    if not data.consent_recorded:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="L'accord du patient doit être recueilli lors de l'annonce du diagnostic.")
    if not doctor.centre_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Votre compte n'est rattaché à aucun centre.")
    phone = data.phone.replace(" ", "")
    if db.query(User).filter(User.phone == phone).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce numéro est déjà utilisé.")
    password = temporary_password()
    user = User(full_name=data.full_name, phone=phone, password_hash=hash_password(password), role="patient", centre_id=doctor.centre_id)
    db.add(user)
    db.flush()
    patient = Patient(
        user_id=user.id,
        doctor_id=doctor.id,
        centre_id=doctor.centre_id,
        cancer_type=data.cancer_type,
        treatment=data.treatment,
        diagnosed_at=data.diagnosed_at,
        consent_recorded_at=now(),
        language=data.language,
        companion_phone=data.companion_phone,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    send_sms(db, phone, f"Laafi Rose : vous êtes inscrit(e) au suivi par {doctor.full_name}. Code de connexion : {password}.")
    return PatientCreated(patient=patient, temporary_password=password)


@router.get("/", response_model=list[PatientOut])
def list_patients(db: Session = Depends(get_db), user: User = Depends(staff_only)):
    query = db.query(Patient).filter(Patient.is_active.is_(True))
    if user.role == "medecin":
        query = query.filter(Patient.doctor_id == user.id)
    elif user.role == "centre":
        query = query.filter(Patient.centre_id == user.centre_id)
    return query.order_by(Patient.created_at.desc()).all()


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: int, db: Session = Depends(get_db), user: User = Depends(staff_only)):
    return get_patient_for_staff(db, patient_id, user)


@router.get("/{patient_id}/seances", response_model=list[SessionOut])
def list_sessions(patient_id: int, db: Session = Depends(get_db), user: User = Depends(staff_only)):
    return sorted(get_patient_for_staff(db, patient_id, user).sessions, key=lambda s: s.scheduled_at)


@router.post("/{patient_id}/seances", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def add_session(patient_id: int, data: SessionCreate, db: Session = Depends(get_db), user: User = Depends(staff_only)):
    get_patient_for_staff(db, patient_id, user)
    session = TreatmentSession(patient_id=patient_id, **data.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.patch("/{patient_id}/seances/{session_id}", response_model=SessionOut)
def update_session(patient_id: int, session_id: int, data: SessionStatusIn, db: Session = Depends(get_db), user: User = Depends(staff_only)):
    patient = get_patient_for_staff(db, patient_id, user)
    session = db.get(TreatmentSession, session_id)
    if not session or session.patient_id != patient.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Séance introuvable.")
    session.status = data.status
    db.commit()
    db.refresh(session)
    if data.status == "manquee":
        create_alert(db, patient, "seance_manquee", symptom=f"Séance de {session.kind} manquée")
    return session


@router.patch("/{patient_id}/fin-de-suivi", response_model=PatientOut)
def end_follow_up(patient_id: int, db: Session = Depends(get_db), user: User = Depends(staff_only)):
    patient = get_patient_for_staff(db, patient_id, user)
    patient.is_active = False
    db.commit()
    db.refresh(patient)
    return patient
