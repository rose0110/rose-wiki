# API et agent OpenPaye

[← Index des projets](README.md)

## Description

Veille API OpenPaye (redoc), wiki des agents, demandes clients (écritures et livre de paie 2026).

## Statut

Actif (activité le 18/10/2026).

## Chemins locaux (PC Windows)

- `Downloads\API-ET-AGENT-OPENPAYE`
- `Python\openpaye-agent`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude

## Automatisations liées

- veille-wiki-openpaye (chaque lundi)
- Codex : veille CCN OpenPaye

## Prochaines étapes

- [ ] Vérifier les nouveaux endpoints
- [ ] Cartographie « Openpaye Migration »

## Contacts / clients

—

## À compléter

- Dépôt GitHub ?
- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\openpaye-agent`
- Dépôt distant : **aucun dépôt distant** (git local uniquement)

### Stack technique
Python 3.11, FastAPI/uvicorn (`backend.api.main:app`), Playwright (robot navigateur OpenPaye), SQLite (`data/migration.db`), front en pages HTML statiques (`frontend/`). Projet construit à l'origine par l'agent « Hermes » sur le VPS, récupéré le 10/10/2026.

### Lancer en local
`uv venv --python 3.11 venv` puis `uv pip install -r requirements.txt` ; lancer `venv/Scripts/python.exe -m uvicorn backend.api.main:app --port 8091` avec `PLAYWRIGHT_CHANNEL=msedge` sur le PC de Rose. Le code ne charge pas `.env.local` tout seul.

### Tester
À compléter (pas de suite de tests documentée). Vérification minimale : `/health` répond, écran de connexion sans erreur console.

### Déployer / mettre en ligne
Aucune mise en ligne active : l'adresse publique d'origine (tunnel Cloudflare) est morte, `openpaye-migration.smartdatapay.com` ne répond pas. À compléter.

### Services externes
OpenPaye (connexion avec le compte de Rose), OpenRouter et Ollama (IA), Webshare (proxys).

### Variables d'environnement (noms seulement)
OLLAMA_API_KEY, OPENPAYE_LOGIN, OPENPAYE_PASSWORD, OPENROUTER_API_KEY, WEBSHARE_API_KEY, WEBSHARE_USERNAME, WEBSHARE_PASSWORD (source : `.env.example`) ; Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git). Les anciennes clés sont restées en clair sur la copie VPS : leur changement est une décision de Rose (non fait au 10/10).

### Chantiers en cours
Voir `PROJECT-HANDOFF.md` (« Prochaine action ») et `STATUS.md` (rédigé par Hermes, non revérifié). Le dossier `Downloads\API-ET-AGENT-OPENPAYE` cité plus haut **n'existe pas** au 19/10/2026.

### Règles de travail de Rose pour ce projet
Données hors git à ne jamais versionner : `.fernet.key`, `.env.test`, `data/` (données personnelles de clients).

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `main` (attention : ce n'est pas forcément la branche de production)

- 85831fc 2026-10-10 Fiches métier d'Hermes (migration, production, contrôle DSN, CRM identité) récupérées du VPS
- 1a4d9cf 2026-10-10 Outil local sans écran de connexion : ouverture directe sur le parcours
- 9de9229 2026-10-10 Connexion OpenPaye : attendre la sortie de la page de connexion, pas le calme réseau
- 4641fdf 2026-10-10 Relier la page de connexion à l'API et retirer les faux succès
- 2e25888 2026-10-10 Faire tourner le projet sur le PC : chemins relatifs, uvloop hors Windows

### Ce qui manque encore à un successeur
- Aucun dépôt distant : le code n'existe que sur le PC (et l'ancienne copie VPS).
- Pas de tests, pas d'hébergement actif.
- Rotation des clés exposées non faite.
