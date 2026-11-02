from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Fiche, Patient, SmsLog, User
from app.schemas import IncomingSms
from app.services.alert_service import create_alert
from app.services.sms_service import send_sms

router = APIRouter()

HELP_TEXT = "Laafi Rose : envoyez AIDE pour alerter votre médecin, SEIN, COL, FOIE ou PROSTATE pour recevoir une fiche."
KEYWORDS = {"SEIN": "sein", "COL": "col", "FOIE": "foie", "PROSTATE": "prostate"}


@router.post("/sms-entrant")
def incoming_sms(data: IncomingSms, db: Session = Depends(get_db)):
    phone = data.phone.replace(" ", "")
    text = data.message.strip().upper()
    db.add(SmsLog(direction="entrant", phone=phone, content=data.message))
    db.commit()

    if text.startswith("AIDE"):
        user = db.query(User).filter(User.phone == phone, User.role == "patient").first()
        patient = db.query(Patient).filter(Patient.user_id == user.id, Patient.is_active.is_(True)).first() if user else None
        if patient:
            alert = create_alert(db, patient, "bouton", symptom=data.message[4:].strip() or None, channel="sms")
            send_sms(db, phone, f"Laafi Rose : alerte #{alert.id} envoyée à votre médecin et à votre centre.")
            return {"action": "alerte", "alert_id": alert.id}
        send_sms(db, phone, "Laafi Rose : en cas d'urgence, rendez-vous au centre de santé le plus proche.")
        return {"action": "orientation"}

    for word, key in KEYWORDS.items():
        if word in text:
            fiche = db.query(Fiche).filter(Fiche.slug.ilike(f"%{key}%"), Fiche.is_published.is_(True)).first()
            if fiche:
                send_sms(db, phone, f"Laafi Rose - {fiche.title} : {fiche.summary}"[:459])
                return {"action": "fiche", "slug": fiche.slug}

    send_sms(db, phone, HELP_TEXT)
    return {"action": "aide"}
