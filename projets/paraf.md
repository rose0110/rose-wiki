# Paraf (signature électronique)

[← Index des projets](README.md)

## Description

Signature électronique (paraf.digital), ruptures conventionnelles TéléRC.

## Statut

Actif (17 sessions + 8 worktrees, 19/10/2026).

## Chemins locaux (PC Windows)

- `Downloads\Python\paraf-signature`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude + Codex

## Automatisations liées

- paraf-101-alerte-rose-soir, paraf-101-relance-midi
- Codex : SEO hebdomadaire Paraf
- Skills paraf, telerc

## Prochaines étapes

- [ ] Demande Paraf 103 (rupture Killian ARSIC) relancée automatiquement : suivre
- [ ] Modèle de relance générique (voir tâches répétitives)

## Contacts / clients

Killian ARSIC (dossier 103)

## À compléter

- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\paraf-signature`
- Dépôt distant : https://github.com/rose0110/paraf-signature.git

### Stack technique
React 19 + TypeScript + Tailwind 4 (Vite), Node/Express + tRPC 11, MySQL/TiDB (Drizzle ORM), Amazon S3, OAuth 2.0, pdf-lib/react-pdf, pré-rendu SEO, pnpm, Vercel.

### Lancer en local
`pnpm install` puis `pnpm dev` (`tsx watch server/_core/index.ts`).

### Tester
`pnpm check`, `pnpm test` (Vitest), `pnpm test:e2e` (Playwright), `pnpm audit:seo`.

### Déployer / mettre en ligne
Vercel (`pnpm run build:client`, crons de renouvellement). Prod : https://paraf.digital. **Pas de déploiement automatique en production** ; projet de Rose = go requis. Lots SEO en observation à ne pas modifier prématurément (cf. `PROJECT-HANDOFF.md`).

### Services externes
Amazon S3, base MySQL/TiDB, OAuth, Vercel, Google Search Console, assistant (chatbot) dont le contexte est généré par `pnpm chatbot:context`.

### Variables d'environnement (noms seulement)
Pas de `.env.example` dans le dépôt : noms **À compléter** (extraire du code). Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`PROJECT-HANDOFF.md` (12/09/2026) : faire progresser SEO et conversions de paraf.digital à partir de données réelles (Search Console), sans toucher aux lots en observation.

### Règles de travail de Rose pour ce projet
Règle 25 : l'assistant de Paraf doit toujours savoir ce que l'application sait faire (régénérer son contexte à chaque changement de fonctionnalité).

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `codex/seo-prerender-indexation` (attention : ce n'est pas forcément la branche de production)

- af0633f 2026-09-12 docs: ajouter la passation canonique Paraf
- 081cf68 2026-09-09 docs(chantier): close SEO guard after production proof
- 28e1cc9 2026-09-09 docs(seo): record production and Search Console proof
- 07d4fc6 2026-09-09 docs(chantier): pointer la preuve de propreté VPS
- 3fb37a2 2026-09-09 docs(chantier): enregistrer l’étape Search Console restante

### Ce qui manque encore à un successeur
- Pas de `.env.example` : un successeur ne sait pas quelles variables poser.
- Handoff du 12/09 : état actuel À compléter.
