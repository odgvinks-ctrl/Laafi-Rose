import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import ADMIN_API_KEY, JWT_SECRET

optional_token = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def current_user_id(token: str | None = Depends(optional_token)) -> int | None:
    if not token or not JWT_SECRET:
        return None
    try:
        return int(jwt.decode(token, JWT_SECRET, algorithms=["HS256"])["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


def require_admin(x_admin_key: str | None = Header(default=None)):
    if not ADMIN_API_KEY or x_admin_key != ADMIN_API_KEY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Clé d'administration invalide.")
