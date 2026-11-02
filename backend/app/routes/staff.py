from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert, Patient, TreatmentSession, User
from app.schemas import DashboardOut
from app.security import require_roles
from app.utils import now

router = APIRouter()


@router.get("/tableau-de-bord", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db), user: User = Depends(require_roles("medecin", "centre", "admin"))):
    patients = db.query(Patient).filter(Patient.is_active.is_(True))
    if user.role == "medecin":
        patients = patients.filter(Patient.doctor_id == user.id)
    elif user.role == "centre":
        patients = patients.filter(Patient.centre_id == user.centre_id)
    ids = [p.id for p in patients.all()]

    start = now().replace(hour=0, minute=0, second=0, microsecond=0)
    sessions = db.query(TreatmentSession).filter(TreatmentSession.patient_id.in_(ids)) if ids else None
    alerts = db.query(Alert).filter(Alert.patient_id.in_(ids)) if ids else None

    today = sessions.filter(TreatmentSession.scheduled_at >= start, TreatmentSession.scheduled_at < start + timedelta(days=1)).count() if ids else 0
    missed = sessions.filter(TreatmentSession.status == "manquee", TreatmentSession.scheduled_at >= now() - timedelta(days=7)).count() if ids else 0
    done = sessions.filter(TreatmentSession.status == "honoree").count() if ids else 0
    total_past = sessions.filter(TreatmentSession.status.in_(["honoree", "manquee"])).count() if ids else 0
    open_alerts = alerts.filter(Alert.status != "cloturee").count() if ids else 0

    delays = [
        (a.received_at - a.created_at).total_seconds() / 60
        for a in (alerts.filter(Alert.received_at.isnot(None)).all() if ids else [])
    ]
    return DashboardOut(
        patients_suivis=len(ids),
        alertes_ouvertes=open_alerts,
        seances_aujourdhui=today,
        seances_manquees_7j=missed,
        delai_moyen_reponse_min=round(sum(delays) / len(delays), 1) if delays else None,
        taux_seances_honorees=round(100 * done / total_past, 1) if total_past else None,
    )
