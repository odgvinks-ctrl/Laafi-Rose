# Bases de données

Deux bases PostgreSQL sur le même serveur :

| Base | Service | Particularité |
|---|---|---|
| `laafi_backend` | `backend/` | — |
| `laafi_ai` | `ai-service/` | extension `vector` (pgvector) pour les embeddings |

Les fichiers `schema.sql` sont générés depuis les modèles SQLAlchemy ; ils servent de référence et pour une installation manuelle. En développement, les tables sont créées automatiquement au démarrage de chaque service, et les migrations passent par Alembic (`backend/alembic`).

Le cache de l'application (`articles`, `audio_files`, `journal_entries`) est en SQLite sur le téléphone : voir `frontend/lib/core/cache/base_locale.dart`.

Installation manuelle :

```bash
psql -U postgres -f ../deployment/init-db.sql
psql -U laafi -d laafi_backend -f backend/schema.sql
psql -U laafi -d laafi_ai -f ai-service/schema.sql
```
