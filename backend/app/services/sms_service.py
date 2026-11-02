import logging

import httpx
from sqlalchemy.orm import Session

from app.models import SmsLog
from config.config import SMS_API_KEY, SMS_API_URL, SMS_PROVIDER, SMS_SENDER

logger = logging.getLogger("laafi.sms")


def send_sms(db: Session, phone: str, content: str) -> bool:
    if not phone:
        return False
    status = "envoye"
    if SMS_PROVIDER == "console" or not SMS_API_URL:
        logger.warning("SMS vers %s : %s", phone, content)
    else:
        try:
            httpx.post(
                SMS_API_URL,
                headers={"Authorization": f"Bearer {SMS_API_KEY}"},
                json={"from": SMS_SENDER, "to": phone, "text": content},
                timeout=10,
            ).raise_for_status()
        except httpx.HTTPError:
            logger.exception("Échec d'envoi du SMS vers %s", phone)
            status = "echec"
    db.add(SmsLog(direction="sortant", phone=phone, content=content, status=status))
    db.commit()
    return status == "envoye"
