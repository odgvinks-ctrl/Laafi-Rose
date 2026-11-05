# Déploiement

```bash
copy .env.example .env
docker compose up -d --build
docker compose exec backend python seed.py
docker compose exec ai-service python seed.py
```

| Service | Port | Rôle |
|---|---|---|
| `db` | 5432 | PostgreSQL 16 + pgvector, bases `laafi_backend` et `laafi_ai` |
| `backend` | 8000 | API métier |
| `ai-service` | 8001 | API IA |
| `nginx` | 80 | `/api/` → backend, `/ia/` → service IA |

En production : changer `JWT_SECRET`, `ADMIN_API_KEY` et les mots de passe, ajouter HTTPS (certificat sur Nginx), ne pas exposer le port 5432, et renseigner les fournisseurs SMS, embeddings et LLM.

L'application se compile avec les adresses publiques :

```bash
flutter build apk --dart-define=API_URL=https://exemple.bf/api --dart-define=IA_URL=https://exemple.bf/ia
```
