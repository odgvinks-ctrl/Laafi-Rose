# API backend

Base : `http://localhost:8000` · Documentation interactive : `/docs`
Authentification : `Authorization: Bearer <access_token>` (obtenu par `/auth/login` ou `/auth/register`).

| Méthode | Route | Accès | Usage |
|---|---|---|---|
| POST | `/auth/register` | public | `{phone, password, first_name, last_name?, city?, language}` → `{access_token}` |
| POST | `/auth/login` | public | `{phone, password}` → `{access_token}` |
| GET | `/users/me` | connecté | compte, rôle et profil |
| PATCH | `/users/me/profile` | connecté | langue, ville, taille du texte… |
| DELETE | `/users/me` | connecté | suppression du compte |
| GET/POST | `/users/` | admin | lister, créer un soignant ou un compte centre |
| GET | `/users/roles` | admin | rôles |
| PATCH | `/users/{id}/desactiver` | admin | désactiver un compte |
| GET | `/health-centers/?city=&category=&verified=&q=&lat=&lng=&updated_since=` | public | annuaire, tri par distance si `lat`/`lng` |
| GET | `/health-centers/{id}` | public | fiche d'un centre avec ses services |
| POST | `/health-centers/` | admin | créer un centre |
| PATCH | `/health-centers/{id}` | admin, centre | modifier |
| GET/POST | `/health-centers/{id}/services` | public / admin, centre | services du centre |
| GET | `/services/categories` | public | catégories existantes (filtres) |
| PATCH/DELETE | `/services/{id}` | admin, centre | modifier, supprimer |
| POST | `/appointments/` | public (jeton facultatif) | demande → `{reference, status: "en_attente"}` |
| GET | `/appointments/mes-demandes` | connecté | demandes de l'utilisateur |
| GET | `/appointments/{reference}?phone=` | public | statut d'une demande |
| GET | `/appointments/centre/{id}` | centre, soignant, admin | demandes reçues |
| PATCH | `/appointments/{reference}` | centre, soignant, admin | changer le statut (notification + SMS) |
| GET | `/notifications/?unread_only=` | connecté | notifications |
| POST | `/notifications/{id}/lue` · `/notifications/tout-lire` | connecté | marquer comme lues |
| DELETE | `/notifications/{id}` | connecté | supprimer |
