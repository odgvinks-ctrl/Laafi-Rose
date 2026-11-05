# Laafi Rose · application Flutter

Application mobile Android et iOS, utilisable hors connexion.

## Première installation

Les dossiers `android/` et `ios/` ne sont pas encore générés. Une seule fois, dans ce dossier :

```bash
flutter create . --project-name laafi_rose --org bf.laafirose --platforms android,ios
flutter pub get
flutter analyze
flutter test
```

`flutter create .` ajoute les dossiers natifs sans toucher au code déjà présent dans `lib/` et `test/`.

Puis dans `android/app/src/main/AndroidManifest.xml`, ajoutez avant `<application` :

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

et, en développement seulement, `android:usesCleartextTraffic="true"` dans la balise `<application>` (API en `http://`).

## Lancer

```bash
flutter run --dart-define=API_URL=http://10.0.2.2:8000 --dart-define=IA_URL=http://10.0.2.2:8001
```

`10.0.2.2` est l'adresse du PC vue depuis l'émulateur Android. Sur un vrai téléphone, utilisez l'adresse IP du PC sur le réseau local.

## Organisation

```
lib/
├── main.dart              démarrage : dépôts, préférences, session, connexion
├── app.dart               MaterialApp, thème, taille du texte, français
├── config.dart            adresses du backend et du service IA
├── theme/                 couleurs et thème Laafi Rose
├── routes/routeur.dart    navigation (go_router) et barre du bas
├── core/
│   ├── api/               client HTTP, stockage sécurisé du jeton
│   ├── cache/             base SQLite locale
│   └── reseau/            détection hors connexion
├── models/                article, fichier audio, journal, centre, rendez-vous…
├── data/                  dépôts : un par source de données
├── state/                 session et préférences
├── widgets/               logo, barre de navigation, bande hors connexion…
└── screens/               un fichier par écran
```

## Cache local (SQLite)

| Table | Contenu | Source |
|---|---|---|
| `articles` | fiches publiées, colonne `enregistre` pour l'accès hors connexion | `ai-service` `/articles` |
| `audio_files` | audios téléchargés (chemin, taille, statut) | URL des audios des articles |
| `journal_entries` | journal personnel (humeur, fatigue, douleur, fièvre, saignement, note) | uniquement sur le téléphone |

## Écrans et routes

| Route | Fichier |
|---|---|
| `/bienvenue` | `screens/bienvenue.dart` |
| `/` | `screens/accueil.dart` |
| `/sinformer` | `screens/sinformer.dart` |
| `/article/:slug` | `screens/article.dart` |
| `/ecouter/:slug` | `screens/ecouter.dart` |
| `/questionnaire` | `screens/questionnaire.dart` |
| `/centres` | `screens/centres.dart` |
| `/centre/:id` | `screens/centre_detail.dart` |
| `/centre/:id/rendez-vous` | `screens/rendez_vous.dart` |
| `/assistant` | `screens/assistant.dart` |
| `/enregistres` | `screens/enregistres.dart` |
| `/journal` | `screens/journal.dart` |
| `/notifications` | `screens/notifications.dart` |
| `/profil` | `screens/profil.dart` |
| `/connexion` | `screens/connexion.dart` |
