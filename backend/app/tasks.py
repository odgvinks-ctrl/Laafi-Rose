import asyncio
import logging

from app.database import SessionLocal
from app.services.alert_service import escalate_pending_alerts
from app.services.reminder_service import send_due_reminders
from config.config import ALERT_CHECK_SECONDS

logger = logging.getLogger("laafi.tasks")


def run_once() -> dict:
    db = SessionLocal()
    try:
        return {"alertes_escaladees": escalate_pending_alerts(db), "rappels_envoyes": send_due_reminders(db)}
    finally:
        db.close()


async def background_loop():
    while True:
        try:
            await asyncio.to_thread(run_once)
        except Exception:
            logger.exception("Erreur dans la tâche de fond")
        await asyncio.sleep(ALERT_CHECK_SECONDS)


if __name__ == "__main__":
    print(run_once())
