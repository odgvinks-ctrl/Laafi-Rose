from sqlalchemy.orm import Session

from app.models import Fiche
from app.utils import now

URGENT_WORDS = [
    "urgence", "urgent", "saigne", "saignement", "hemorragie", "très mal", "tres mal",
    "douleur forte", "malaise", "evanoui", "évanoui", "fièvre", "fievre", "respire mal",
]

URGENT_REPLY = (
    "Ce que vous décrivez peut nécessiter un avis médical rapide. "
    "Rendez-vous sans attendre au centre de santé le plus proche ou contactez les services d'urgence. "
    "Si vous êtes suivi(e) pour un cancer, utilisez le bouton « J'ai besoin d'aide » de votre suivi."
)

DISCLAIMER = "Ces informations sont générales et ne remplacent pas l'avis d'un professionnel de santé."


def _normalize(text: str) -> str:
    import unicodedata
    return "".join(c for c in unicodedata.normalize("NFD", text.lower()) if unicodedata.category(c) != "Mn")


def answer(db: Session, question: str) -> dict:
    q = _normalize(question)
    if any(_normalize(w) in q for w in URGENT_WORDS):
        return {"urgence": True, "reponse": URGENT_REPLY, "sources": [], "fiches": []}

    words = [w for w in q.replace("?", " ").replace(",", " ").split() if len(w) > 3]
    fiches = db.query(Fiche).filter(Fiche.is_published.is_(True)).all()
    scored = []
    for f in fiches:
        haystack = _normalize(f"{f.title} {f.summary or ''} {f.keywords or ''}")
        score = sum(1 for w in words if w in haystack)
        if score:
            scored.append((score, f))
    scored.sort(key=lambda x: -x[0])
    best = [f for _, f in scored[:2]]

    if not best:
        return {
            "urgence": False,
            "reponse": "Je n'ai pas trouvé de fiche qui réponde à cette question. Posez-la à un professionnel de santé, ou reformulez avec un mot simple comme « sein », « col » ou « foie ». " + DISCLAIMER,
            "sources": [],
            "fiches": [],
        }

    reply = " ".join(f"{f.title} : {f.summary}" for f in best if f.summary)
    sources = []
    for f in best:
        sources.extend(s.strip() for s in (f.sources or "").split("|") if s.strip())
    return {
        "urgence": False,
        "reponse": f"{reply} {DISCLAIMER}".strip(),
        "sources": list(dict.fromkeys(sources)),
        "fiches": [f.slug for f in best],
    }
