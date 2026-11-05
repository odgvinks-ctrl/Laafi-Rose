from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db, now
from app.core.security import require_roles
from app.models import HealthCenter, Service, User
from app.schemas.health_center import HealthCenterIn, HealthCenterOut, HealthCenterUpdate, ServiceIn, ServiceOut
from app.services.geo import distance_km

router = APIRouter()


def get_or_404(db: Session, center_id: int) -> HealthCenter:
    center = db.get(HealthCenter, center_id)
    if not center:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Centre introuvable.")
    return center


def check_manager(user: User, center_id: int):
    if user.role.code != "admin" and user.health_center_id != center_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")


def to_out(center: HealthCenter, lat=None, lng=None) -> HealthCenterOut:
    out = HealthCenterOut.model_validate(center)
    out.distance_km = distance_km(lat, lng, center.latitude, center.longitude)
    return out


@router.get("/", response_model=list[HealthCenterOut])
def list_centers(
    city: str | None = None,
    category: str | None = None,
    verified: bool = False,
    q: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    updated_since: datetime | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(HealthCenter)
    if city:
        query = query.filter(HealthCenter.city == city)
    if verified:
        query = query.filter(HealthCenter.verified.is_(True))
    if q:
        like = f"%{q}%"
        query = query.filter(HealthCenter.name.ilike(like) | HealthCenter.district.ilike(like) | HealthCenter.city.ilike(like))
    if category:
        query = query.join(Service).filter(Service.category == category, Service.available.is_(True)).distinct()
    if updated_since:
        query = query.filter(HealthCenter.updated_at >= updated_since)
    result = [to_out(c, lat, lng) for c in query.all()]
    if lat is not None and lng is not None:
        result.sort(key=lambda c: c.distance_km if c.distance_km is not None else 1e9)
    else:
        result.sort(key=lambda c: c.name)
    return result


@router.get("/{center_id}", response_model=HealthCenterOut)
def get_center(center_id: int, lat: float | None = None, lng: float | None = None, db: Session = Depends(get_db)):
    return to_out(get_or_404(db, center_id), lat, lng)


@router.post("/", response_model=HealthCenterOut, status_code=status.HTTP_201_CREATED)
def create_center(data: HealthCenterIn, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    center = HealthCenter(**data.model_dump(), verified_at=now() if data.verified else None)
    db.add(center)
    db.commit()
    db.refresh(center)
    return to_out(center)


@router.patch("/{center_id}", response_model=HealthCenterOut)
def update_center(center_id: int, data: HealthCenterUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre"))):
    check_manager(user, center_id)
    center = get_or_404(db, center_id)
    values = data.model_dump(exclude_unset=True)
    for key, value in values.items():
        setattr(center, key, value)
    if values.get("verified"):
        center.verified_at = now()
    db.commit()
    db.refresh(center)
    return to_out(center)


@router.get("/{center_id}/services", response_model=list[ServiceOut])
def list_services(center_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, center_id).services


@router.post("/{center_id}/services", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def add_service(center_id: int, data: ServiceIn, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre"))):
    check_manager(user, center_id)
    get_or_404(db, center_id)
    service = Service(health_center_id=center_id, **data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service
