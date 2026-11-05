# Laafi Rose · service IA

Service FastAPI séparé (base `laafi_ai`, avec l'extension **pgvector**) qui gère les contenus médicaux validés et l'assistant d'information.

## Tables gérées

| Table | Rôle |
|---|---|
| `documents` | fiches et articles : brouillon → publié après relecture médicale |
| `sources` | références citées par chaque document (OMS, CIRC, protocoles nationaux…) |
| `embeddings` | extraits des documents publiés et leurs vecteurs (recherche sémantique) |
| `chat_sessions` | conversations avec l'assistant (anonymes ou liées à un utilisateur du backend) |
| `chat_messages` | questions et réponses, avec sources et marqueur d'urgence |
| `ai_logs` | événements : réponse, urgence, refus de diagnostic, sans résultat, erreur, latence |

## Fonctionnement de l'assistant

1. **Garde-fous** (`services/safety.py`) : un symptôme urgent renvoie immédiatement vers les soins, une demande de diagnostic ou de traitement est refusée poliment.
2. **Recherche** (`services/retrieval.py`) : les extraits les plus proches de la question, uniquement dans les documents **publiés**.
3. **Réponse** (`services/generation.py`) : composée à partir de ces extraits seulement, avec les sources et le rappel « ne remplace pas une consultation ».
4. **Journal** (`ai_logs`) : chaque réponse est tracée pour le suivi qualité.

En développement, `EMBEDDING_PROVIDER=local` et `LLM_PROVIDER=local` fonctionnent sans clé ni modèle externe. En production, passez-les à `api` et renseignez un fournisseur compatible OpenAI.

## Démarrer

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
uvicorn app.main:app --reload --port 8001
```

Documentation : http://localhost:8001/docs · Tests : `python -m pytest -q`

Les routes `/documents` et `/logs` demandent l'en-tête `X-Admin-Key`. Le contrat complet est dans `docs/api-ia.md`.
