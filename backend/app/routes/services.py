from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.models import Service, User
from app.schemas.health_center import ServiceOut, ServiceUpdate

router = APIRouter()


@router.get("/categories", response_model=list[str])
def categories(db: Session = Depends(get_db)):
    return sorted({c for (c,) in db.query(Service.category).distinct()})


@router.patch("/{service_id}", response_model=ServiceOut)
def update_service(service_id: int, data: ServiceUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre"))):
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service introuvable.")
    if user.role.code != "admin" and user.health_center_id != service.health_center_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
    values = data.model_dump(exclude_unset=True)
    if not values:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucune modification fournie.",
        )

    for key, value in values.items():
        setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles("admin", "centre"))):
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service introuvable.")
    if user.role.code != "admin" and user.health_center_id != service.health_center_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")
    db.delete(service)
    db.commit()
