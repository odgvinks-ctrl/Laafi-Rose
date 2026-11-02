from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginIn, Token
from app.security import create_access_token, verify_password

router = APIRouter()


@router.post("/login", response_model=Token)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone.replace(" ", "")).first()
    if not user or not user.is_active or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Numéro ou mot de passe incorrect.")
    return Token(access_token=create_access_token(user.id))
