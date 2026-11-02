from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert, Appointment, Patient, Reminder, User
from app.schemas import StatsOut
from app.security import require_roles

router = APIRouter()


@router.get("/", response_model=StatsOut)
def aggregated_stats(db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    appointments = db.query(Appointment).all()
    patients = db.query(Patient).all()
    alerts = db.query(Alert).all()
    delays = [(a.received_at - a.created_at).total_seconds() / 60 for a in alerts if a.received_at]
    return StatsOut(
        orientations_rendez_vous=len(appointments),
        rendez_vous_par_ville=dict(Counter(a.centre.city or "Inconnue" for a in appointments)),
        patients_suivis=sum(1 for p in patients if p.is_active),
        patients_par_cancer=dict(Counter(p.cancer_type for p in patients)),
        alertes_total=len(alerts),
        alertes_par_type=dict(Counter(a.type for a in alerts)),
        delai_moyen_reponse_min=round(sum(delays) / len(delays), 1) if delays else None,
        rappels_actifs=db.query(Reminder).filter(Reminder.active.is_(True)).count(),
    )
