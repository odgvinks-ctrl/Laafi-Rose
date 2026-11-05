# API service IA

Base : `http://localhost:8001` · Documentation interactive : `/docs`

## Pour l'application

| Méthode | Route | Usage |
|---|---|---|
| GET | `/articles/?categorie=&depuis=` | articles publiés (synchronisation du cache) |
| GET | `/articles/retires` | slugs des articles retirés |
| GET | `/articles/{slug}` | un article |
| POST | `/chat/sessions` | `{language}` → `{id}` ; jeton du backend facultatif |
| GET | `/chat/sessions/{id}/messages` | historique |
| POST | `/chat/sessions/{id}/messages` | `{content}` → réponse `{content, sources, document_slugs, is_urgent}` |
| DELETE | `/chat/sessions/{id}` | supprimer la conversation |

Format d'un article :

```json
{
  "slug": "cancer-du-col",
  "titre": "Cancer du col de l'utérus",
  "categorie": "cancer",
  "resume": "…",
  "contenu": "…",
  "langue": "fr",
  "lecture_minutes": 5,
  "audios": {"fr": "https://…/col-fr.mp3", "mo": "https://…/col-mo.mp3"},
  "sources": [{"title": "…", "organisation": "OMS", "url": null, "year": null}],
  "revise_le": "2026-11-04T10:00:00",
  "mis_a_jour_le": "2026-11-04T10:00:00"
}
```

## Administration (en-tête `X-Admin-Key`)

| Méthode | Route | Usage |
|---|---|---|
| GET | `/documents/?status_filter=` | tous les documents |
| POST | `/documents/` | créer un brouillon avec ses sources |
| PATCH | `/documents/{slug}` | modifier (un document publié repasse en `a_relire`) |
| POST | `/documents/{slug}/publier` | `{reviewed_by}` : publie et indexe ; refusé sans source |
| POST | `/documents/{slug}/retirer` | retirer de l'application et de l'assistant |
| POST | `/documents/reindexer` | recalculer tous les embeddings |
| GET | `/logs/resume` | statistiques des réponses de l'assistant |
