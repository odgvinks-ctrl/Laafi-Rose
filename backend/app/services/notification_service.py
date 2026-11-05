import logging
import secrets
import string

import httpx
from sqlalchemy.orm import Session

from app.core.config import SMS_API_KEY, SMS_API_URL, SMS_PROVIDER, SMS_SENDER
from app.models import Notification

logger = logging.getLogger("laafi.notifications")


def reference(prefix="LR"):
    alphabet = string.ascii_uppercase + string.digits
    return f"{prefix}-" + "".join(secrets.choice(alphabet) for _ in range(8))


def send_sms(phone: str, text: str) -> bool:
    if not phone:
        return False
    if SMS_PROVIDER == "console" or not SMS_API_URL:
        logger.warning("SMS vers %s : %s", phone, text)
        return True
    try:
        httpx.post(
            SMS_API_URL,
            headers={"Authorization": f"Bearer {SMS_API_KEY}"},
            json={"from": SMS_SENDER, "to": phone, "text": text},
            timeout=10,
        ).raise_for_status()
        return True
    except httpx.HTTPError:
        logger.exception("Échec d'envoi du SMS vers %s", phone)
        return False


def notify(db: Session, user_id: int | None, type: str, title: str, body: str = "", link: str | None = None, phone: str | None = None):
    if user_id:
        db.add(Notification(user_id=user_id, type=type, title=title, body=body, link=link))
        db.commit()
    if phone:
        send_sms(phone, f"Laafi Rose : {title}. {body}".strip())
