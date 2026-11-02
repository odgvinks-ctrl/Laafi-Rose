from datetime import timedelta

from sqlalchemy.orm import Session

from app.models import Alert, AlertEvent, Centre, Patient
from app.services.sms_service import send_sms
from app.utils import distance_km, now
from config.config import ALERT_ESCALATION_MINUTES, EMERGENCY_PHONE

TYPE_LABELS = {
    "bouton": "demande d'aide",
    "symptome": "symptôme grave signalé",
    "seance_manquee": "séance manquée",
}


def _event(db: Session, alert: Alert, label: str):
    db.add(AlertEvent(alert_id=alert.id, label=label))


def _position_text(alert: Alert) -> str:
    if alert.latitude is None or alert.longitude is None:
        return "position inconnue"
    return f"https://maps.google.com/?q={alert.latitude},{alert.longitude}"


def _message(alert: Alert, patient: Patient) -> str:
    return (
        f"LAAFI ROSE ALERTE #{alert.id} - {TYPE_LABELS.get(alert.type, alert.type)}. "
        f"Patient : {patient.user.full_name} ({patient.user.phone}), {patient.cancer_type}"
        f"{', ' + patient.treatment if patient.treatment else ''}. "
        f"{alert.symptom + '. ' if alert.symptom else ''}"
        f"Position : {_position_text(alert)}"
    )


def create_alert(db: Session, patient: Patient, type: str, symptom=None, latitude=None, longitude=None, channel="internet") -> Alert:
    latitude = latitude if latitude is not None else patient.last_latitude
    longitude = longitude if longitude is not None else patient.last_longitude
    alert = Alert(
        patient_id=patient.id,
        type=type,
        symptom=symptom,
        latitude=latitude,
        longitude=longitude,
        channel=channel,
    )
    db.add(alert)
    db.flush()
    _event(db, alert, "Alerte envoyée" + (" par SMS" if channel == "sms" else ""))
    db.commit()
    db.refresh(alert)

    message = _message(alert, patient)
    send_sms(db, patient.doctor.phone, message)
    if patient.centre and patient.centre.phone:
        send_sms(db, patient.centre.phone, message)
    if patient.companion_phone and type == "seance_manquee":
        send_sms(db, patient.companion_phone, "Laafi Rose : une séance de traitement a été manquée. L'équipe soignante va vous contacter.")
    return alert


def mark_received(db: Session, alert: Alert, staff_name: str):
    if alert.status == "envoyee" or alert.status == "escaladee":
        alert.status = "recue"
        alert.received_at = now()
        _event(db, alert, f"Reçue par {staff_name}")
        db.commit()


def take_charge(db: Session, alert: Alert, staff):
    alert.status = "prise_en_charge"
    alert.handled_by_id = staff.id
    alert.handled_at = now()
    if not alert.received_at:
        alert.received_at = alert.handled_at
    _event(db, alert, f"Prise en charge par {staff.full_name}")
    db.commit()
    send_sms(db, alert.patient.user.phone, f"Laafi Rose : {staff.full_name} a pris en charge votre alerte et va vous contacter.")


def close_alert(db: Session, alert: Alert, staff):
    alert.status = "cloturee"
    alert.closed_at = now()
    _event(db, alert, f"Clôturée par {staff.full_name}")
    db.commit()


def _nearest_on_call_centre(db: Session, alert: Alert, exclude_ids: set[int]):
    centres = db.query(Centre).filter(Centre.is_on_call.is_(True)).all()
    best, best_d = None, None
    for c in centres:
        if c.id in exclude_ids:
            continue
        d = distance_km(alert.latitude, alert.longitude, c.latitude, c.longitude)
        if best is None or (d is not None and (best_d is None or d < best_d)):
            best, best_d = c, d
    return best


def escalate_pending_alerts(db: Session) -> int:
    limit = now() - timedelta(minutes=ALERT_ESCALATION_MINUTES)
    pending = (
        db.query(Alert)
        .filter(Alert.status.in_(["envoyee", "escaladee"]), Alert.received_at.is_(None))
        .all()
    )
    count = 0
    for alert in pending:
        last = alert.events[-1].created_at if alert.events else alert.created_at
        if last > limit:
            continue
        patient = alert.patient
        message = _message(alert, patient)
        if alert.escalation_level == 0:
            excluded = {patient.centre_id}
            centre = _nearest_on_call_centre(db, alert, excluded)
            alert.escalation_level = 1
            alert.status = "escaladee"
            if centre:
                alert.escalated_centre_id = centre.id
                _event(db, alert, f"Sans réponse : transmise au centre de garde {centre.name}")
                db.commit()
                send_sms(db, centre.phone, message)
            else:
                _event(db, alert, "Sans réponse : aucun centre de garde disponible")
                db.commit()
            count += 1
        elif alert.escalation_level == 1:
            alert.escalation_level = 2
            _event(db, alert, "Sans réponse : transmise aux services d'urgence")
            db.commit()
            if EMERGENCY_PHONE:
                send_sms(db, EMERGENCY_PHONE, message)
            send_sms(db, patient.user.phone, "Laafi Rose : rendez-vous sans attendre au centre de santé le plus proche ou appelez les services d'urgence.")
            count += 1
    return count
