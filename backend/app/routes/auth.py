from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db, now
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Profile, Role, User
from app.schemas.auth import LoginIn, RegisterIn, TokenOut

router = APIRouter()


def clean_phone(phone: str) -> str:
    return phone.replace(" ", "")


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    phone = clean_phone(data.phone)
    if db.query(User).filter(User.phone == phone).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce numéro est déjà utilisé.")
    role = db.query(Role).filter(Role.code == "utilisateur").first()
    if not role:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Les rôles ne sont pas initialisés.")
    user = User(phone=phone, password_hash=hash_password(data.password), role=role)
    user.profile = Profile(first_name=data.first_name, last_name=data.last_name, city=data.city, language=data.language)
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=create_access_token(user))


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == clean_phone(data.phone)).first()
    if not user or not user.is_active or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Numéro ou mot de passe incorrect.")
    user.last_login_at = now()
    db.commit()
    return TokenOut(access_token=create_access_token(user))
