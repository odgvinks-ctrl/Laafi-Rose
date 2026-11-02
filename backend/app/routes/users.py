from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut
from app.security import get_current_user, hash_password, require_roles

router = APIRouter()


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    phone = data.phone.replace(" ", "")
    if db.query(User).filter(User.phone == phone).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce numéro est déjà utilisé.")
    user = User(
        full_name=data.full_name,
        phone=phone,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        centre_id=data.centre_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/", response_model=list[UserOut])
def list_users(role: str | None = None, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()


@router.patch("/{user_id}/desactiver", response_model=UserOut)
def deactivate_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable.")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user
