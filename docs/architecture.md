# Architecture

## Vue d'ensemble

```
             Application Flutter (Android / iOS)
             cache SQLite : articles · audio_files · journal_entries
                    │                         │
          JWT       │                         │   JWT facultatif
                    ▼                         ▼
        ┌────────────────────┐     ┌──────────────────────┐
        │ backend  :8000     │     │ ai-service  :8001    │
        │ FastAPI            │     │ FastAPI              │
        └─────────┬──────────┘     └──────────┬───────────┘
                  │                           │
        PostgreSQL laafi_backend     PostgreSQL laafi_ai + pgvector
```

Les deux services partagent le même `JWT_SECRET` : le jeton délivré par le backend permet au service IA de rattacher une conversation à un utilisateur, sans que le service IA accède à la base du backend.

## Répartition des données

### Backend (`laafi_backend`)

| Table | Contenu |
|---|---|
| `roles` | `utilisateur`, `soignant`, `centre`, `admin` |
| `users` | téléphone, mot de passe chiffré (bcrypt), rôle, centre de rattachement |
| `profiles` | prénom, nom, genre, année de naissance, ville, langue, taille du texte |
| `health_centers` | nom, type, ville, quartier, adresse, téléphone, GPS, horaires, rendez-vous en ligne, vérification |
| `services` | services d'un centre : catégorie (`depistage_col`, `depistage_sein`, `depistage_hepatites`, `information`…), gratuité |
| `appointments` | référence, centre, service, créneau souhaité, coordonnées, statut (`en_attente`, `confirme`, `annule`, `honore`, `absent`) |
| `notifications` | notifications dans l'application, avec SMS si nécessaire |

### Service IA (`laafi_ai`)

| Table | Contenu |
|---|---|
| `documents` | fiches médicales : `brouillon` → `publie` après relecture (`reviewed_by`, `reviewed_at`), ou `retire` |
| `sources` | références de chaque document (OMS, CIRC, protocoles nationaux) ; obligatoires pour publier |
| `embeddings` | extraits des documents publiés et leurs vecteurs |
| `chat_sessions` | conversations, anonymes ou liées à un utilisateur |
| `chat_messages` | messages, sources citées, documents utilisés, marqueur d'urgence |
| `ai_logs` | événement (`reponse`, `urgence`, `refus_diagnostic`, `sans_resultat`, `erreur`), latence, score |

### Application (SQLite sur le téléphone)

| Table | Contenu |
|---|---|
| `articles` | copie des documents publiés (`/articles` du service IA), colonne `enregistre` |
| `audio_files` | audios téléchargés pour l'écoute hors connexion |
| `journal_entries` | journal personnel ; ne quitte jamais le téléphone |

## Synchronisation des articles

1. Au démarrage et au retour du réseau, l'application appelle `GET /articles/?depuis=<dernière synchro>` sur le service IA.
2. Les articles reçus remplacent la copie locale, sans perdre la marque « enregistré ».
3. `GET /articles/retires` indique les fiches retirées, supprimées du téléphone.

## Principes

- L'application et l'assistant ne posent aucun diagnostic et ne prescrivent rien.
- Seuls les documents publiés et sourcés servent à l'assistant.
- Les données de santé personnelles (journal) restent sur le téléphone.
- Conformité à la loi n° 001-2021/AN sur les données personnelles (déclaration auprès de la CIL).
