from datetime import timedelta

from app.database import Base, SessionLocal, engine
from app.models import Audio, Centre, Fiche, Godmother, Question, User
from app.security import hash_password
from app.utils import now

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(User).filter(User.role == "admin").first():
    print("Données déjà présentes.")
    raise SystemExit

saaga = Centre(
    name="Centre médical Saaga (exemple)",
    type="Centre médical (CMA)",
    city="Ouagadougou",
    district="[quartier]",
    phone="+22600000001",
    latitude=12.3714,
    longitude=-1.5197,
    services="Dépistage du col (IVA)|Examen clinique des seins|Consultation d'information",
    accepts_appointments=True,
    verified=True,
    verified_at=now(),
)
garde = Centre(
    name="Centre hospitalier de garde (exemple)",
    type="Centre hospitalier",
    city="Ouagadougou",
    phone="+22600000002",
    latitude=12.3560,
    longitude=-1.5340,
    services="Urgences|Oncologie",
    is_on_call=True,
    verified=True,
    verified_at=now(),
)
sya = Centre(
    name="Centre médical Sya (exemple)",
    type="Centre médical (CMA)",
    city="Bobo-Dioulasso",
    phone="+22600000003",
    latitude=11.1771,
    longitude=-4.2979,
    services="Dépistage du col (IVA)|Dépistage des hépatites B et C",
    accepts_appointments=True,
    verified=True,
    verified_at=now(),
)
db.add_all([saaga, garde, sya])
db.flush()

db.add_all([
    User(full_name="Administrateur Laafi", phone="+22670000000", password_hash=hash_password("admin12345"), role="admin"),
    User(full_name="Dr Exemple", phone="+22670000001", password_hash=hash_password("medecin12345"), role="medecin", centre_id=saaga.id),
    User(full_name="Accueil Saaga", phone="+22670000002", password_hash=hash_password("centre12345"), role="centre", centre_id=saaga.id),
])

sources = "OMS, aide-mémoire|CIRC, GLOBOCAN|Recommandations nationales (à compléter)"
fiches = [
    Fiche(slug="cancer-du-sein", category="cancer", title="Cancer du sein", summary="Une boule, un changement de la peau ou du mamelon doivent être montrés à un soignant. Un examen des seins peut être demandé en consultation.", keywords="sein seins boule mammographie autopalpation", sources=sources, reading_minutes=6, is_published=True, reviewed_at=now()),
    Fiche(slug="cancer-du-col", category="cancer", title="Cancer du col de l'utérus", summary="Il est lié le plus souvent au HPV. Le vaccin et le dépistage gratuit (IVA ou test HPV) permettent de le prévenir.", keywords="col uterus hpv papillomavirus iva vaccin depistage", sources=sources, reading_minutes=5, is_published=True, reviewed_at=now()),
    Fiche(slug="cancer-du-foie", category="cancer", title="Cancer du foie", summary="Souvent lié aux hépatites B et C. Une prise de sang permet le dépistage, et un vaccin protège contre l'hépatite B.", keywords="foie hepatite hepatites aflatoxine", sources=sources, reading_minutes=4, is_published=True, reviewed_at=now()),
    Fiche(slug="cancer-de-la-prostate", category="cancer", title="Cancer de la prostate", summary="Des difficultés à uriner ont souvent une cause bénigne. En parler à un soignant dès 50 ans permet de faire le point.", keywords="prostate homme hommes uriner psa", sources=sources, reading_minutes=4, is_published=True, reviewed_at=now()),
]
db.add_all(fiches)
db.flush()
db.add_all([
    Audio(fiche_id=fiches[1].id, title="Le dépistage du col, expliqué simplement", language="fr", status="disponible", duration_seconds=252, size_mb=2.9),
    Audio(fiche_id=fiches[1].id, title="Le dépistage du col, expliqué simplement", language="mo", status="disponible", duration_seconds=260, size_mb=3.1),
    Audio(fiche_id=fiches[1].id, title="Le dépistage du col, expliqué simplement", language="dy", status="en_preparation"),
])

db.add_all([
    Question(position=1, statement="Une boule dans le sein est toujours le signe d'un cancer.", answer="faux", explanation="La plupart des boules ne sont pas des cancers, mais toute boule nouvelle doit être montrée à un soignant.", key_point="Une boule dans le sein doit être examinée."),
    Question(position=2, statement="Un vaccin aide à prévenir le cancer du col de l'utérus.", answer="vrai", explanation="Le vaccin contre le HPV protège contre les virus le plus souvent responsables de ce cancer.", key_point="Le vaccin HPV protège contre le cancer du col."),
    Question(position=3, statement="Le dépistage n'est utile que lorsqu'on a des symptômes.", answer="faux", explanation="Le dépistage s'adresse aux personnes qui se sentent bien.", key_point="Le dépistage concerne aussi les personnes en bonne santé."),
])

db.add(Godmother(first_name="Awa (exemple)", city="Ouagadougou", languages="fr,mo", story="Accompagne les femmes au début de leur traitement."))
db.commit()
db.close()
print("Données de démonstration créées.")
