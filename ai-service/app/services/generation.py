import httpx

from app.core.config import LLM_API_KEY, LLM_API_URL, LLM_MODEL, LLM_PROVIDER
from app.services.safety import DISCLAIMER

SYSTEM_PROMPT = (
    "Tu es l'assistant d'information de Laafi Rose, application de prévention des cancers au Burkina Faso. "
    "Réponds en français simple, en 3 à 6 phrases, uniquement à partir des extraits fournis. "
    "Ne pose jamais de diagnostic, ne recommande aucun médicament ni dosage. "
    "Si les extraits ne permettent pas de répondre, dis-le et oriente vers un professionnel de santé. "
    "Termine toujours en rappelant que l'application ne remplace pas une consultation."
)


def provider_name() -> str:
    return LLM_MODEL if LLM_PROVIDER == "api" else "local-extractif"


def _extractive(question: str, passages: list[str]) -> str:
    best = passages[:2]
    sentences = []
    for p in best:
        for s in p.replace("\n", " ").split(". "):
            s = s.strip().rstrip(".")
            if len(s) > 30 and s not in sentences:
                sentences.append(s)
            if len(sentences) >= 4:
                break
    return ". ".join(sentences) + ". " + DISCLAIMER


def answer(question: str, passages: list[str], language: str = "fr") -> str:
    if LLM_PROVIDER != "api":
        return _extractive(question, passages)
    context = "\n\n".join(f"[{i + 1}] {p}" for i, p in enumerate(passages))
    response = httpx.post(
        LLM_API_URL,
        headers={"Authorization": f"Bearer {LLM_API_KEY}"},
        json={
            "model": LLM_MODEL,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Extraits :\n{context}\n\nQuestion : {question}"},
            ],
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()
