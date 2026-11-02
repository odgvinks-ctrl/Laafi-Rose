# Laafi Rose

Application de prévention, d'orientation et de suivi des cancers au Burkina Faso, en français, en mooré et en dioula, utilisable hors connexion.

```
Laafi Rose/
├── frontend/   React + Vite (PWA installable sur Android)
└── backend/    FastAPI + PostgreSQL
```

- Frontend : voir `frontend/README.md` (liste des pages et des routes)
- Backend : voir `backend/README.md` (installation, rôles, contrat d'API, tâches restantes)

Lancer les deux ensemble :

```bash
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

Dans `frontend/.env` : `VITE_API_URL=http://localhost:8000`.
