# Laafi Rose · frontend (React + Vite)

Application web responsive (téléphone, tablette, PC) et installable (PWA).

- Téléphone : en-tête + barre d'onglets en bas.
- PC (à partir de 960 px) : menu latéral à gauche, contenus en colonnes.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir http://localhost:5173. Sur un téléphone du même Wi-Fi : `http://<IP du PC>:5173`.

Le serveur de développement relaie les appels :

| Préfixe | Service | Par défaut |
|---|---|---|
| `/api` | backend | http://localhost:8000 |
| `/ia` | ai-service | http://localhost:8001 |

Pour d'autres adresses, copier `.env.example` en `.env` et modifier `BACKEND_URL` et `IA_URL`.

## Lancer les services en local (SQLite, sans PostgreSQL)

Backend (PowerShell) :

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
$env:DATABASE_URL="sqlite:///./laafi.db"
$env:JWT_SECRET="une-cle-longue-identique-pour-les-deux-services"
python seed.py
uvicorn app.main:app --reload --port 8000
```

ai-service (autre terminal) :

```powershell
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
$env:DATABASE_URL="sqlite:///./laafi_ai.db"
$env:JWT_SECRET="une-cle-longue-identique-pour-les-deux-services"
$env:ADMIN_API_KEY="cle-admin"
python seed.py
uvicorn app.main:app --reload --port 8001
```

Comptes de démonstration : `70000000 / admin12345`, `70000001 / soignant12345`, `70000002 / centre12345`.

## Production

```bash
npm run build
```

Le dossier `dist/` est servi par nginx (voir `deployment/nginx.conf`), qui relaie `/api/` et `/ia/`.

## Pages

| Route | Page |
|---|---|
| `/bienvenue` | Première ouverture, choix de la langue |
| `/` | Accueil |
| `/sinformer`, `/sinformer/:slug` | Catalogue et fiche |
| `/ecouter/:slug` | Audio (français, mooré, dioula), enregistrement hors ligne |
| `/questionnaire` | Vrai ou faux |
| `/centres`, `/centres/:id` | Annuaire et fiche d'un centre |
| `/centres/:id/rendez-vous` | Demande de rendez-vous |
| `/rendez-vous/:reference` | Suivi d'une demande |
| `/assistant` | Assistant d'information |
| `/enregistres` | Contenus disponibles hors ligne |
| `/journal` | Journal personnel (reste sur l'appareil) |
| `/profil`, `/notifications`, `/connexion` | Compte et préférences |

## Organisation

```
src/
  api/          appels au backend (/api) et à l'ai-service (/ia), cache des fiches
  components/   Layout (menu PC + onglets mobile), cartes, encadrés, états vides
  context/      session et préférences
  hooks/        réseau, localisation, synchronisation des fiches
  pages/        une page = un fichier .jsx + son .css
  utils/        stockage local, journal, audios hors ligne, textes
  data/         langues, rubriques, questionnaire
```
