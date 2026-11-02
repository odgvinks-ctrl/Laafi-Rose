# Laafi Rose · backend

API FastAPI + PostgreSQL de Laafi Rose : fiches, centres de santé, rendez-vous, suivi des patients, alertes médicales géolocalisées, rappels, marraines et Laafi Voix (SMS).

## Démarrer

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements.txt
copy .env.example .env            # puis remplir JWT_SECRET
docker compose up -d              # PostgreSQL local (ou votre propre serveur)
python seed.py                    # données de démonstration
uvicorn app.main:app --reload
```

- Documentation interactive : http://localhost:8000/docs
- Tests : `python -m pytest -q` (base SQLite temporaire, aucune configuration nécessaire)

Comptes de démonstration créés par `seed.py` (numéro / mot de passe) :

| Rôle | Téléphone | Mot de passe |
|---|---|---|
| admin | +22670000000 | admin12345 |
| medecin | +22670000001 | medecin12345 |
| centre | +22670000002 | centre12345 |

Les centres et les fiches du seed sont des **exemples** : aucune adresse ni aucun numéro réel.

## Organisation

```
backend/
├── app/
│   ├── main.py              application, CORS, routes, tâche de fond
│   ├── database.py          connexion SQLAlchemy
│   ├── models.py            toutes les tables
│   ├── schemas.py           entrées et sorties de l'API (Pydantic)
│   ├── security.py          mots de passe, JWT, contrôle des rôles
│   ├── utils.py             distance GPS, références, dates
│   ├── tasks.py             escalade des alertes et rappels (toutes les ALERT_CHECK_SECONDS)
│   ├── routes/              un fichier par domaine
│   └── services/
│       ├── alert_service.py      création, réception, prise en charge, escalade
│       ├── sms_service.py        envoi SMS (console en dev, fournisseur en prod)
│       ├── reminder_service.py   rappels vaccination, autopalpation, séances
│       └── assistant_service.py  détection d'urgence et réponse à partir des fiches
├── config/config.py         variables d'environnement
├── alembic/                 migrations
├── seed.py                  données de démonstration
└── tests/test_parcours.py   parcours complets testés
```

## Rôles

| Rôle | Qui | Accès |
|---|---|---|
| (aucun) | grand public | fiches, audios, questionnaire, assistant, centres, rendez-vous, rappels, marraines |
| `patient` | patient inscrit par son médecin | son suivi, état du jour, alertes |
| `medecin` | médecin référent | inscrire des patients, séances, alertes de ses patients, tableau de bord |
| `centre` | accueil d'un centre | créneaux, demandes de rendez-vous, alertes du centre |
| `admin` | équipe Laafi Rose | comptes, centres, fiches, statistiques anonymisées |

## Contrat d'API

Authentification : `Authorization: Bearer <access_token>`.

| Méthode | Route | Rôle | Usage (page du frontend) |
|---|---|---|---|
| POST | `/auth/login` | public | `{phone, password}` → `{access_token}` (Connexion) |
| GET | `/users/me` | connecté | compte courant |
| POST/GET | `/users/` | admin | créer / lister médecins, centres |
| GET | `/fiches/?category=&q=` | public | S'informer |
| GET | `/fiches/{slug}` | public | Fiche (avec ses audios) |
| POST/PATCH | `/fiches/` · `/fiches/{slug}` | admin | publication des contenus validés |
| GET | `/audios/?language=` · `/audios/{id}` | public | Écouter |
| GET | `/questionnaire/` | public | Questionnaire |
| POST | `/assistant/` | public | `{question, langue}` → `{urgence, reponse, sources, fiches}` |
| GET | `/centres/?ville=&service=&verifies=&q=&lat=&lng=` | public | Centres (tri par distance si lat/lng) |
| GET | `/centres/{id}` · `/centres/{id}/creneaux` | public | Fiche du centre, créneaux |
| POST | `/centres/{id}/signalements` | public | Signaler une information incorrecte |
| POST | `/centres/{id}/creneaux` | centre, admin | publier des créneaux |
| POST | `/rendez-vous/` | public | demande → `{reference, status: "en_attente"}` |
| GET | `/rendez-vous/{reference}` | public | statut de la demande |
| PATCH | `/rendez-vous/{reference}` | centre, medecin | confirmer ou annuler (SMS au demandeur) |
| POST | `/patients/` | medecin | inscrire un patient dès le diagnostic → code de connexion envoyé par SMS |
| GET | `/patients/` · `/patients/{id}` | soignant | Patients, Dossier |
| POST/PATCH | `/patients/{id}/seances[/{sid}]` | soignant | séances ; `manquee` déclenche une alerte |
| GET | `/suivi/moi` | patient | Mon suivi |
| POST | `/suivi/etat-du-jour` | patient | fièvre, saignement ou douleur ≥ 8 → alerte automatique |
| POST | `/alertes/` | patient | bouton « J'ai besoin d'aide » `{type, symptom, latitude, longitude}` |
| GET | `/alertes/{id}` | patient, soignant | statut et historique (AlerteStatut) |
| GET | `/alertes/?statut=` | soignant | Alertes |
| POST | `/alertes/{id}/prise-en-charge` · `/cloture` | soignant | traitement de l'alerte |
| GET | `/soignant/tableau-de-bord` | soignant | Tableau de bord |
| POST | `/rappels/` | public | vaccin HPV, hépatite B, autopalpation (SMS ou vocal) |
| GET | `/marraines/` · POST `/marraines/demandes` | public | Marraines Laafi |
| POST | `/voix/sms-entrant` | fournisseur SMS | `AIDE` → alerte ; `SEIN`, `COL`, `FOIE`, `PROSTATE` → fiche par SMS |
| GET | `/statistiques/` | admin | chiffres agrégés, aucune donnée individuelle |

## Parcours d'une alerte

1. Le patient touche « J'ai besoin d'aide », signale un symptôme grave, envoie `AIDE` par SMS, ou une séance est marquée manquée.
2. `alert_service.create_alert` enregistre l'alerte avec la position et envoie un SMS au médecin référent et au centre.
3. Le soignant ouvre l'alerte (statut `recue`), puis la prend en charge (`prise_en_charge`) : le patient est prévenu par SMS.
4. Sans réception après `ALERT_ESCALATION_MINUTES`, la tâche de fond la transmet au centre de garde le plus proche (`escaladee`, niveau 1), puis aux services d'urgence (`EMERGENCY_PHONE`, niveau 2).

L'accord du patient est recueilli une seule fois par le médecin à l'inscription (`consent_recorded`), comme l'exige la loi n° 001-2021/AN ; ensuite tout est automatique.

## Ce qui reste à faire

- [ ] Brancher un vrai fournisseur SMS et serveur vocal dans `services/sms_service.py` (variables `SMS_*`)
- [ ] Remplacer la réponse par mots-clés de `assistant_service.py` par un modèle de langage limité aux fiches validées
- [ ] Première migration Alembic : `alembic revision --autogenerate -m "initial"` puis `alembic upgrade head`
- [ ] Hébergement des fichiers audio (champ `Audio.url`)
- [ ] Notifications en temps réel pour l'espace soignant (WebSocket ou push)
- [ ] Limitation du nombre de requêtes sur les routes publiques (`/rendez-vous/`, `/assistant/`, `/voix/sms-entrant`)
- [ ] Vérifier la signature du fournisseur sur `/voix/sms-entrant`
