from datetime import timedelta

from sqlalchemy.orm import Session

from app.models import Reminder, TreatmentSession
from app.services.sms_service import send_sms
from app.utils import now

MESSAGES = {
    "vaccin_hpv": "Laafi Rose : pensez au vaccin contre le HPV pour votre fille (9 à 14 ans). Il est gratuit dans les centres de santé.",
    "hepatite_b": "Laafi Rose : pensez au vaccin et au dépistage de l'hépatite B. Renseignez-vous au centre de santé le plus proche.",
    "autopalpation": "Laafi Rose : c'est le moment de votre autopalpation des seins du mois. Ouvrez l'application pour être guidée pas à pas.",
}


def next_date(reminder: Reminder):
    base = now()
    if reminder.kind == "autopalpation":
        day = reminder.day_of_month or 1
        month = base.month + 1 if base.day >= day else base.month
        year = base.year + (1 if month > 12 else 0)
        month = 1 if month > 12 else month
        return base.replace(year=year, month=month, day=day, hour=9, minute=0, second=0, microsecond=0)
    return base + timedelta(days=180)


def send_due_reminders(db: Session) -> int:
    count = 0
    for r in db.query(Reminder).filter(Reminder.active.is_(True), Reminder.next_at <= now()).all():
        send_sms(db, r.phone, MESSAGES[r.kind])
        r.next_at = next_date(r)
        count += 1
    tomorrow = now() + timedelta(days=1)
    sessions = (
        db.query(TreatmentSession)
        .filter(TreatmentSession.status == "prevue", TreatmentSession.reminder_sent.is_(False), TreatmentSession.scheduled_at <= tomorrow)
        .all()
    )
    for s in sessions:
        when = s.scheduled_at.strftime("%d/%m à %Hh%M")
        send_sms(db, s.patient.user.phone, f"Laafi Rose : rappel de votre séance ({s.kind}) le {when} à {s.patient.centre.name}.")
        if s.patient.companion_phone:
            send_sms(db, s.patient.companion_phone, f"Laafi Rose : rappel de la séance de votre proche le {when}.")
        s.reminder_sent = True
        count += 1
    db.commit()
    return count
