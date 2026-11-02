from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Godmother, GodmotherRequest, User
from app.schemas import GodmotherCreate, GodmotherOut, GodmotherRequestIn, GodmotherRequestOut
from app.security import require_roles

router = APIRouter()


@router.get("/", response_model=list[GodmotherOut])
def list_godmothers(ville: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Godmother).filter(Godmother.available.is_(True))
    if ville:
        query = query.filter(Godmother.city == ville)
    return query.all()


@router.post("/", response_model=GodmotherOut, status_code=status.HTTP_201_CREATED)
def add_godmother(data: GodmotherCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    godmother = Godmother(**data.model_dump())
    db.add(godmother)
    db.commit()
    db.refresh(godmother)
    return godmother


@router.post("/demandes", response_model=GodmotherRequestOut, status_code=status.HTTP_201_CREATED)
def request_godmother(data: GodmotherRequestIn, db: Session = Depends(get_db)):
    request = GodmotherRequest(**data.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)
    return request
