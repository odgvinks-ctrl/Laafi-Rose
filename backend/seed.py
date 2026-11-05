from app.core.database import Base, SessionLocal, engine, now
from app.core.security import hash_password
from app.models import HealthCenter, Profile, Role, Service, User

Base.metadata.create_all(bind=engine)
db = SessionLocal()

ROLES = [
    ("utilisateur", "Utilisateur de l'application"),
    ("soignant", "Professionnel de santé"),
    ("centre", "Accueil d'un centre de santé"),
    ("admin", "Équipe Laafi Rose"),
]
for code, label in ROLES:
    if not db.query(Role).filter(Role.code == code).first():
        db.add(Role(code=code, label=label))
db.commit()

if not db.query(HealthCenter).first():
    saaga = HealthCenter(
        name="Centre médical Saaga (exemple)",
        type="Centre médical (CMA)",
        city="Ouagadougou",
        phone="+22600000001",
        latitude=12.3714,
        longitude=-1.5197,
        opening_hours="Lun-Ven 7h30-16h00 · Sam 8h00-12h00",
        accepts_appointments=True,
        verified=True,
        verified_at=now(),
    )
    sya = HealthCenter(
        name="Centre médical Sya (exemple)",
        type="Centre médical (CMA)",
        city="Bobo-Dioulasso",
        phone="+22600000003",
        latitude=11.1771,
        longitude=-4.2979,
        accepts_appointments=True,
        verified=True,
        verified_at=now(),
    )
    saaga.services = [
        Service(name="Dépistage du cancer du col (IVA)", category="depistage_col", is_free=True),
        Service(name="Examen clinique des seins", category="depistage_sein", is_free=True),
        Service(name="Consultation d'information", category="information"),
    ]
    sya.services = [
        Service(name="Dépistage du cancer du col (IVA)", category="depistage_col", is_free=True),
        Service(name="Dépistage des hépatites B et C", category="depistage_hepatites"),
    ]
    db.add_all([saaga, sya])
    db.commit()

roles = {r.code: r for r in db.query(Role).all()}
saaga = db.query(HealthCenter).filter(HealthCenter.city == "Ouagadougou").first()
ACCOUNTS = [
    ("+22670000000", "admin12345", "admin", None, "Admin"),
    ("+22670000001", "soignant12345", "soignant", saaga.id, "Dr Exemple"),
    ("+22670000002", "centre12345", "centre", saaga.id, "Accueil Saaga"),
]
for phone, password, role, center_id, name in ACCOUNTS:
    if not db.query(User).filter(User.phone == phone).first():
        user = User(phone=phone, password_hash=hash_password(password), role=roles[role], health_center_id=center_id)
        user.profile = Profile(first_name=name)
        db.add(user)
db.commit()
db.close()
print("Données de démonstration prêtes.")
