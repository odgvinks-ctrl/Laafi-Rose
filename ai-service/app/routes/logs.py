from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.models import AiLog

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/resume")
def summary(db: Session = Depends(get_db)):
    logs = db.query(AiLog).all()
    latencies = [l.latency_ms for l in logs if l.latency_ms is not None]
    return {
        "total": len(logs),
        "par_evenement": dict(Counter(l.event for l in logs)),
        "latence_moyenne_ms": round(sum(latencies) / len(latencies)) if latencies else None,
    }
