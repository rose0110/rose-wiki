# Asteren (Pablo)

[← Index des projets](README.md)

## Description

Application de recette collaborative / STC pour le client Pablo, classement OneDrive.

## Statut

Actif (39 + 3 sessions, 19/10/2026).

## Chemins locaux (PC Windows)

- `Downloads\Pablo`
- `Downloads\Pablo\asteren-v1`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude + Codex

## Automatisations liées

- asteren-retours-recette-du-matin
- Suivi Codex sur VPS

## Prochaines étapes

- [ ] Chantier « relevés à résoudre »
- [ ] Chantier « STC dossiers réels »
- [ ] Démo client

## Contacts / clients

Pablo (client)

## À compléter

- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Pablo\asteren-v1`
- Dépôt distant : https://github.com/rose0110/asteren-v1.git

### Stack technique
Next.js (TypeScript), Node 24.18, npm ; stockage Vercel KV/Blob pour la Preview ; cible finale hébergement privé OVH (runtime documentaire local). Données **synthétiques uniquement**.

### Lancer en local
`Copy-Item .env.example .env.local`, `npm ci`, `npm run dev`. E2E sur le port 3217 (arrêter d'abord le serveur caché du port 4000).

### Tester
`npx vitest run tests/unit tests/integration tests/calcul tests/security tests/robustesse` ; après build, `grep -rl decimal .next/static/chunks/*.js` doit être vide ; CI `.github/workflows/ci.yml` (qualité + E2E).

### Déployer / mettre en ligne
Recette uniquement : `npx vercel deploy --target=recette --yes --env ASTEREN_BUILD_SHA=$(git rev-parse HEAD)` (sans le SHA, la connexion casse). **Ne jamais utiliser `--target=preview`** (reclassé en Production par Vercel, incident du 18/07/2026). Pas de production.

### Services externes
Vercel (KV, Blob), OneDrive (manifeste synthétique), cible OVH ; aucun envoi réel à l'AGS, France Travail, MH, EDI, DSN ou e-mail.

### Variables d'environnement (noms seulement)
ASTEREN_DATA_BACKEND, ASTEREN_SESSION_SECRET, ASTEREN_BOOTSTRAP_TOKEN, ASTEREN_UPLOAD_MAX_BYTES_PER_WINDOW, ASTEREN_PREVIEW_USER_EMAIL, ASTEREN_PREVIEW_USER_PASSWORD, ASTEREN_BUILD_SHA, ASTEREN_APP_ORIGIN, ASTEREN_DEPLOYMENT_TARGET, ASTEREN_PRIVATE_DOCUMENT_RUNTIME_SOCKET, KV_REST_API_URL, KV_REST_API_TOKEN, BLOB_READ_WRITE_TOKEN (source : `.env.example`) ; Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
Chantiers pilotés par des fichiers `PROMPT-CHANTIER-*.md` dans `Downloads\Pablo` (ex. RUN2 recette de septembre : devis signé, tests sur dossiers réels dès le 5/10, livraison finale le 30/11/2026). Voir aussi « Prochaines étapes » (relevés, STC dossiers réels, démo client).

### Règles de travail de Rose pour ce projet
`CLAUDE.md` : aucune donnée client réelle dans le code, les tests ou les commits (un test l'interdit) ; design selon `docs/regles/DESIGN-SIMPLICITE-CONTEXTUELLE.md` (une action principale par écran, divulgation progressive) ; couleurs depuis `src/app/globals.css` (charte terracotta/paper) ; chaque règle chiffrée sourcée (`docs/regles/REGISTRE-SOURCES-OFFICIELLES.md`), jamais de taux en dur.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `feat/preview-septembre-2026` (attention : ce n'est pas forcément la branche de production)

- bf903bd 2026-09-05 docs: cadrer le chantier rc1 sdtc [skip actions]
- 4cfc45b 2026-09-05 chore: sceller le chantier ingestion [skip actions]
- 2072c80 2026-09-05 chore: livrer le chantier sans workflow [skip actions]
- 6ba9079 2026-09-05 fix: terminer les jobs firecracker apres vsock
- 772a84d 2026-09-05 fix: rendre la construction microvm executable

### Ce qui manque encore à un successeur
- Branche locale `feat/preview-septembre-2026` datée du 05/09 : état réel de la recette d'octobre À compléter.
- Plan de bascule vers OVH : À compléter.
- Contact client et calendrier contractuel : dans le devis (dossier `Devis-STC-DEV-2026-001`), à résumer.
