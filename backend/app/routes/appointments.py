from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Appointment, Centre, Slot, User
from app.schemas import AppointmentCreate, AppointmentOut, AppointmentStatusIn
from app.security import require_roles
from app.services.sms_service import send_sms
from app.utils import reference

router = APIRouter()


@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def request_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    if not data.consent:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Votre accord est nécessaire pour envoyer la demande.")
    centre = db.get(Centre, data.centre_id)
    if not centre or not centre.accepts_appointments:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ce centre ne reçoit pas de demandes en ligne.")
    if data.slot_id:
        slot = db.get(Slot, data.slot_id)
        if not slot or slot.centre_id != centre.id or slot.is_taken:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce créneau n'est plus disponible.")
        slot.is_taken = True
    appointment = Appointment(
        reference=reference(),
        centre_id=centre.id,
        slot_id=data.slot_id,
        service=data.service,
        name=data.name.strip(),
        phone=data.phone.replace(" ", ""),
        contact_method=data.contact_method,
        language=data.language,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    send_sms(db, centre.phone, f"Laafi Rose : nouvelle demande de rendez-vous {appointment.reference} ({appointment.service}) de {appointment.name}, {appointment.phone}.")
    return appointment


@router.get("/centre/{centre_id}", response_model=list[AppointmentOut])
def list_for_centre(centre_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre", "medecin"))):
    if user.role != "admin" and user.centre_id != centre_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
    return db.query(Appointment).filter(Appointment.centre_id == centre_id).order_by(Appointment.created_at.desc()).all()


@router.get("/{ref}", response_model=AppointmentOut)
def get_status(ref: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.reference == ref).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demande introuvable.")
    return appointment


@router.patch("/{ref}", response_model=AppointmentOut)
def update_status(ref: str, data: AppointmentStatusIn, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre", "medecin"))):
    appointment = db.query(Appointment).filter(Appointment.reference == ref).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demande introuvable.")
    if user.role != "admin" and user.centre_id != appointment.centre_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
    appointment.status = data.status
    if data.status == "annule" and appointment.slot:
        appointment.slot.is_taken = False
    db.commit()
    db.refresh(appointment)
    if data.status == "confirme":
        send_sms(db, appointment.phone, f"Laafi Rose : votre rendez-vous {appointment.reference} au {appointment.centre.name} est confirmé.")
    return appointment
