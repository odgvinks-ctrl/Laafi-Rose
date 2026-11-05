from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, hash_password, require_roles
from app.models import Profile, Role, User
from app.schemas.user import ProfileOut, ProfileUpdate, RoleOut, StaffCreate, UserOut

router = APIRouter()


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me/profile", response_model=ProfileOut)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.profile is None:
        user.profile = Profile(first_name=data.first_name or "")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user.profile, key, value)
    db.commit()
    db.refresh(user.profile)
    return user.profile


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.delete(user)
    db.commit()


@router.get("/roles", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    return db.query(Role).all()


@router.get("/", response_model=list[UserOut])
def list_users(role: str | None = None, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    query = db.query(User).join(Role)
    if role:
        query = query.filter(Role.code == role)
    return query.order_by(User.created_at.desc()).all()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_staff(data: StaffCreate, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    phone = data.phone.replace(" ", "")
    if db.query(User).filter(User.phone == phone).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce numéro est déjà utilisé.")
    role = db.query(Role).filter(Role.code == data.role).first()
    user = User(phone=phone, password_hash=hash_password(data.password), role=role, health_center_id=data.health_center_id)
    user.profile = Profile(first_name=data.first_name, last_name=data.last_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/desactiver", response_model=UserOut)
def deactivate(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable.")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user
