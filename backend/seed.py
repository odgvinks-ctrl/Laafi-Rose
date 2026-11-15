import os

from app.core.database import SessionLocal, now
from app.core.security import hash_password
from app.models import HealthCenter, Profile, Role, Service, User


ROLES_REQUIRED = ["utilisateur", "soignant", "centre", "admin"]


def get_or_create_center(db, name, center_type, city, phone, latitude, longitude, opening_hours=None):
    center = db.query(HealthCenter).filter(
        HealthCenter.name == name
    ).first()

    if center:
        return center

    center = HealthCenter(
        name=name,
        type=center_type,
        city=city,
        phone=phone,
        latitude=latitude,
        longitude=longitude,
        opening_hours=opening_hours,
        accepts_appointments=True,
        verified=True,
        verified_at=now(),
    )

    db.add(center)
    db.flush()
    return center


def main():
    app_env = os.getenv("APP_ENV", "development").strip().lower()

    if app_env != "demo":
        print("Mode DEMO désactivé. Aucune donnée créée.")
        return

    passwords = {
        "admin": os.getenv("DEMO_ADMIN_PASSWORD", ""),
        "soignant": os.getenv("DEMO_STAFF_PASSWORD", ""),
        "centre": os.getenv("DEMO_CENTER_PASSWORD", ""),
    }

    for role, password in passwords.items():
        if len(password) < 12:
            raise RuntimeError(
                f"DEMO_{role.upper()}_PASSWORD doit contenir au moins 12 caractères."
            )

    db = SessionLocal()

    try:
        roles = {
            role.code: role
            for role in db.query(Role).filter(
                Role.code.in_(ROLES_REQUIRED)
            ).all()
        }

        missing_roles = set(ROLES_REQUIRED) - set(roles)

        if missing_roles:
            raise RuntimeError(
                "Rôles manquants. Exécutez d'abord les migrations Alembic : "
                + ", ".join(sorted(missing_roles))
            )

        saaga = get_or_create_center(
            db,
            name="Centre médical Saaga (exemple)",
            center_type="Centre médical (CMA)",
            city="Ouagadougou",
            phone="+22600000001",
            latitude=12.3714,
            longitude=-1.5197,
            opening_hours="Lun-Ven 7h30-16h00 · Sam 8h00-12h00",
        )

        sya = get_or_create_center(
            db,
            name="Centre médical Sya (exemple)",
            center_type="Centre médical (CMA)",
            city="Bobo-Dioulasso",
            phone="+22600000003",
            latitude=11.1771,
            longitude=-4.2979,
        )

        db.flush()

        if not db.query(Service).filter(
            Service.health_center_id == saaga.id
        ).first():
            saaga.services = [
                Service(
                    name="Dépistage du cancer du col (IVA)",
                    category="depistage_col",
                    is_free=True,
                ),
                Service(
                    name="Examen clinique des seins",
                    category="depistage_sein",
                    is_free=True,
                ),
                Service(
                    name="Consultation d'information",
                    category="information",
                ),
            ]

        if not db.query(Service).filter(
            Service.health_center_id == sya.id
        ).first():
            sya.services = [
                Service(
                    name="Dépistage du cancer du col (IVA)",
                    category="depistage_col",
                    is_free=True,
                ),
                Service(
                    name="Dépistage des hépatites B et C",
                    category="depistage_hepatites",
                ),
            ]

        accounts = [
            (
                "+22670000000",
                passwords["admin"],
                "admin",
                None,
                "Admin",
            ),
            (
                "+22670000001",
                passwords["soignant"],
                "soignant",
                saaga.id,
                "Dr Exemple",
            ),
            (
                "+22670000002",
                passwords["centre"],
                "centre",
                saaga.id,
                "Accueil Saaga",
            ),
        ]

        for phone, password, role_code, center_id, first_name in accounts:
            existing_user = db.query(User).filter(
                User.phone == phone
            ).first()

            if existing_user:
                continue

            user = User(
                phone=phone,
                password_hash=hash_password(password),
                role=roles[role_code],
                health_center_id=center_id,
            )
            user.profile = Profile(first_name=first_name)
            db.add(user)

        db.commit()
        print("Données de démonstration créées ou déjà présentes.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
