from app.services.text import normalize

URGENT_PATTERNS = [
    "urgence", "urgent", "saigne", "saignement", "hemorragie", "tres mal", "douleur forte", "douleur intense",
    "malaise", "evanoui", "perdu connaissance", "fievre", "respire mal", "du mal a respirer", "convulsion",
]
DIAGNOSIS_PATTERNS = [
    "est ce que j ai un cancer", "ai je un cancer", "j ai un cancer", "suis je malade", "quel traitement prendre",
    "quel medicament", "combien de comprimes", "dose", "posologie", "diagnostic",
]

URGENT_REPLY = (
    "Ce que vous décrivez peut nécessiter un avis médical rapide. Rendez-vous sans attendre au centre de santé "
    "le plus proche ou contactez les services d'urgence. Ne restez pas seul(e) avec ce symptôme."
)
DIAGNOSIS_REPLY = (
    "Je ne peux pas poser de diagnostic ni conseiller un traitement. Seul un professionnel de santé peut le faire "
    "après vous avoir examiné(e). Je peux en revanche vous expliquer les signes à surveiller et vous aider à trouver "
    "un centre de santé."
)
NO_ANSWER = (
    "Je n'ai pas trouvé d'information validée pour répondre à cette question. Posez-la à un professionnel de santé, "
    "ou reformulez avec un mot simple comme « sein », « col », « foie » ou « prostate »."
)
DISCLAIMER = "Ces informations sont générales et ne remplacent pas l'avis d'un professionnel de santé."


def _match(text: str, patterns: list[str]) -> bool:
    t = " " + normalize(text).replace("'", " ").replace("-", " ") + " "
    return any(f" {p} " in t or p in t for p in patterns)


def is_urgent(text: str) -> bool:
    return _match(text, URGENT_PATTERNS)


def asks_diagnosis(text: str) -> bool:
    return _match(text, DIAGNOSIS_PATTERNS)
