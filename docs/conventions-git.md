# Organisation Git

Un seul dépôt (monorepo) : `odgvinks-ctrl/Laafi-Rose`.

## Branches

| Branche | Usage |
|---|---|
| `main` | version stable, démontrable |
| `dev` | intégration des fonctionnalités terminées |
| `front/<sujet>` | travail sur l'application (ex. `front/ecran-centres`) |
| `back/<sujet>` | travail sur le backend (ex. `back/rendez-vous`) |
| `ia/<sujet>` | travail sur le service IA (ex. `ia/garde-fous`) |

On part de `dev`, on ouvre une pull request vers `dev`, puis `dev` est fusionnée dans `main` pour chaque version.

## Messages de commit

```
front: écran des centres avec filtres
back: confirmation des rendez-vous par SMS
ia: refus des demandes de diagnostic
docs: contrat de l'API IA
```

## Règles

- Ne jamais committer de fichier `.env`, de clé ou de mot de passe.
- Chacun ne modifie que son dossier ; un changement d'API se fait d'abord dans `docs/`.
- `git pull` avant de commencer, `git push` en fin de journée.
