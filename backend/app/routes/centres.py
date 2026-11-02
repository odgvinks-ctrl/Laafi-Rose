from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Centre, CentreReport, Slot, User
from app.schemas import CentreCreate, CentreOut, CentreUpdate, ReportIn, SlotCreate, SlotOut
from app.security import require_roles
from app.utils import distance_km, now

router = APIRouter()


def to_out(centre: Centre, lat=None, lng=None) -> CentreOut:
    return CentreOut(
        id=centre.id,
        name=centre.name,
        type=centre.type,
        city=centre.city,
        district=centre.district,
        address=centre.address,
        phone=centre.phone,
        latitude=centre.latitude,
        longitude=centre.longitude,
        services=[s for s in (centre.services or "").split("|") if s],
        hours=centre.hours,
        accepts_appointments=centre.accepts_appointments,
        is_on_call=centre.is_on_call,
        verified=centre.verified,
        verified_at=centre.verified_at,
        distance_km=distance_km(lat, lng, centre.latitude, centre.longitude),
    )


def get_or_404(db: Session, centre_id: int) -> Centre:
    centre = db.get(Centre, centre_id)
    if not centre:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Centre introuvable.")
    return centre


def can_manage(user: User, centre_id: int):
    if user.role != "admin" and user.centre_id != centre_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")


@router.get("/", response_model=list[CentreOut])
def list_centres(
    ville: str | None = None,
    service: str | None = None,
    verifies: bool = False,
    q: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Centre)
    if ville:
        query = query.filter(Centre.city == ville)
    if service:
        query = query.filter(Centre.services.ilike(f"%{service}%"))
    if verifies:
        query = query.filter(Centre.verified.is_(True))
    if q:
        like = f"%{q}%"
        query = query.filter((Centre.name.ilike(like)) | (Centre.district.ilike(like)) | (Centre.city.ilike(like)))
    result = [to_out(c, lat, lng) for c in query.all()]
    if lat is not None and lng is not None:
        result.sort(key=lambda c: c.distance_km if c.distance_km is not None else 1e9)
    else:
        result.sort(key=lambda c: c.name)
    return result


@router.get("/{centre_id}", response_model=CentreOut)
def get_centre(centre_id: int, lat: float | None = None, lng: float | None = None, db: Session = Depends(get_db)):
    return to_out(get_or_404(db, centre_id), lat, lng)


@router.post("/", response_model=CentreOut, status_code=status.HTTP_201_CREATED)
def create_centre(data: CentreCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    values = data.model_dump()
    values["services"] = "|".join(values["services"])
    centre = Centre(**values, verified_at=now() if data.verified else None)
    db.add(centre)
    db.commit()
    db.refresh(centre)
    return to_out(centre)


@router.patch("/{centre_id}", response_model=CentreOut)
def update_centre(centre_id: int, data: CentreUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre"))):
    can_manage(user, centre_id)
    centre = get_or_404(db, centre_id)
    values = data.model_dump(exclude_unset=True)
    if "services" in values:
        values["services"] = "|".join(values["services"] or [])
    for key, value in values.items():
        setattr(centre, key, value)
    if values.get("verified"):
        centre.verified_at = now()
    db.commit()
    db.refresh(centre)
    return to_out(centre)


@router.post("/{centre_id}/signalements", status_code=status.HTTP_201_CREATED)
def report_error(centre_id: int, data: ReportIn, db: Session = Depends(get_db)):
    get_or_404(db, centre_id)
    db.add(CentreReport(centre_id=centre_id, message=data.message))
    db.commit()
    return {"message": "Merci. Votre signalement sera vérifié."}


@router.get("/{centre_id}/creneaux", response_model=list[SlotOut])
def list_slots(centre_id: int, db: Session = Depends(get_db)):
    get_or_404(db, centre_id)
    return (
        db.query(Slot)
        .filter(Slot.centre_id == centre_id, Slot.is_taken.is_(False), Slot.starts_at >= now())
        .order_by(Slot.starts_at)
        .all()
    )


@router.post("/{centre_id}/creneaux", response_model=SlotOut, status_code=status.HTTP_201_CREATED)
def create_slot(centre_id: int, data: SlotCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre"))):
    can_manage(user, centre_id)
    get_or_404(db, centre_id)
    slot = Slot(centre_id=centre_id, **data.model_dump())
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot
