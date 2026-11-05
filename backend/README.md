# Laafi Rose · backend

API métier en FastAPI + PostgreSQL (base `laafi_backend`).

## Tables gérées

| Table | Rôle |
|---|---|
| `users` | comptes (téléphone, mot de passe, rôle, centre de rattachement) |
| `roles` | `utilisateur`, `soignant`, `centre`, `admin` |
| `profiles` | prénom, ville, langue (fr, mo, dy), taille du texte |
| `health_centers` | centres de santé, position GPS, horaires, vérification |
| `services` | services proposés par chaque centre (dépistage du col, des seins, des hépatites…) |
| `appointments` | demandes de rendez-vous et leur statut |
| `notifications` | notifications dans l'application (et SMS si besoin) |

Les contenus, l'assistant et les conversations sont dans `ai-service`.

## Démarrer

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
uvicorn app.main:app --reload --port 8000
```

Documentation interactive : http://localhost:8000/docs · Tests : `python -m pytest -q`

Comptes de démonstration : admin `+22670000000` / `admin12345`, soignant `+22670000001` / `soignant12345`, centre `+22670000002` / `centre12345`.

## Organisation

```
backend/
├── app/
│   ├── main.py
│   ├── core/        config, base de données, sécurité (JWT, rôles)
│   ├── models/      une table par fichier
│   ├── schemas/     entrées et sorties de l'API
│   ├── routes/      auth, users, health_centers, services, appointments, notifications
│   └── services/    notifications et SMS, calcul de distance
├── alembic/         migrations
├── seed.py          rôles, centres et comptes de démonstration
└── tests/
```

Le contrat d'API complet est dans `docs/api-backend.md`.
