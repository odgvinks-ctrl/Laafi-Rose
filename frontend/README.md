# Laafi Rose · frontend

Application React + Vite, installable sur Android (PWA) et utilisable hors connexion.

## Lancer

```bash
npm install
cp .env.example .env
npm run dev
```

Sans `VITE_API_URL`, les fiches, les centres et le questionnaire utilisent les données de démonstration de `src/data`.

## Pages

| Route | Page | Écran |
|---|---|---|
| `/bienvenue` | `Bienvenue.jsx` | Ouverture et présentation |
| `/` | `Accueil.jsx` | Accueil |
| `/sinformer` | `Sinformer.jsx` | Catalogue des cancers, facteurs, dépistage |
| `/sinformer/:slug` | `Fiche.jsx` | Détail d'une fiche |
| `/questionnaire` | `Questionnaire.jsx` | Questionnaire éducatif |
| `/centres` | `Centres.jsx` | Annuaire des centres (liste et carte) |
| `/centres/:id` | `CentreDetail.jsx` | Fiche d'un centre |
| `/centres/:id/rendez-vous` | `RendezVous.jsx` | Demande de rendez-vous en 4 étapes |
| `/ecouter/:id` | `Ecouter.jsx` | Lecteur audio et langues |
| `/assistant` | `Assistant.jsx` | Assistant d'information |
| `/enregistres` | `Enregistres.jsx` | Bibliothèque hors connexion |
| `/profil` | `Profil.jsx` | Profil, préférences, confidentialité |
| `/rappels` | `Rappels.jsx` | Rappels vaccination et autopalpation |
| `/marraines` | `Marraines.jsx` | Marraines Laafi |
| `/connexion` | `Connexion.jsx` | Connexion patient et soignant |
| `/mon-suivi` | `MonSuivi.jsx` | Suivi du patient et bouton d'aide |
| `/alertes/:id` | `AlerteStatut.jsx` | Statut d'une alerte envoyée |
| `/soignant` | `soignant/TableauDeBord.jsx` | Espace soignant |
| `/soignant/alertes` | `soignant/Alertes.jsx` | Alertes en temps réel |
| `/soignant/patients` | `soignant/Patients.jsx` | Patients suivis |
| `/soignant/patients/nouveau` | `soignant/NouveauPatient.jsx` | Inscription d'un patient |
| `/soignant/patients/:id` | `soignant/PatientDetail.jsx` | Dossier d'un patient |

Les icônes de l'application (`public/icone-192.png`, `public/icone-512.png`) sont à ajouter.
