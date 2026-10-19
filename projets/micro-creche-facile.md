# Micro-Crèche Facile

[← Index des projets](README.md)

## Description

Site et SEO, vidéos YouTube, migration Vercel + Supabase, page portage / consulting avec simulateur.

## Statut

Actif, SEO et vidéos automatisés (sessions 14/10, automatisations Codex 19/10).

## Chemins locaux (PC Windows)

- `Python\microcreche-facile`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude + Codex

## Automatisations liées

- Codex : vidéos, SEO continu, SEO hebdomadaire, réception veille VPS SEO, veille YouTube
- Suivi Codex sur VPS

## Prochaines étapes

- À définir.

## Contacts / clients

—

## À compléter

- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\microcreche-facile`
- Dépôt distant : https://github.com/rose0110/microcreche-facile.git

### Stack technique
React + Vite, Express + tRPC, Drizzle, PostgreSQL, Stripe (packs), Resend, Vercel ; production vidéo YouTube suivie dans Airtable.

### Lancer en local
`pnpm install` puis `pnpm dev`.

### Tester
`pnpm check`, `pnpm test`, scripts `test:commerce:postgres`, `test:stripe:*`, `test:marketing:*` ; workflow `chantier-completion-guard.yml`.

### Déployer / mettre en ligne
Vercel. Projet de Rose : go requis. Commerce piloté par drapeaux (`COMMERCE_LIVE_ENABLED`, `COMMERCE_LEGAL_READY`).

### Services externes
Stripe, Resend, PostgreSQL, ELENET (API), Vercel, Airtable (suivi éditorial YouTube), YouTube.

### Variables d'environnement (noms seulement)
ADMIN_EMAIL, COMMERCE_ALLOWED_ORIGINS, COMMERCE_LEGAL_READY, COMMERCE_LIVE_ENABLED, CRON_SECRET, DATABASE_URL, ELENET_API_ANON_KEY, JWT_SECRET, MARKETING_AUTOMATION_ENABLED, MARKETING_TOKEN_SECRET, PUBLIC_DOMAIN, REPLY_TO_EMAIL, RESEND_API_KEY, RESEND_WEBHOOK_SECRET, SOURCE_DATABASE_URL, STRIPE_PRICE_PACK_* (5 packs), STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, TARGET_DATABASE_URL, VERCEL_ENV (source : `.env.example`) ; Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`PROJECT-HANDOFF.md` (19/10) : épisode vidéo V052 PAJE/PSU préparé (textes), six films programmés ; dessins, voix et film non produits. Nombreux worktrees `microcreche-facile-*` (packs C1–C5, SEO, veille, vidéo).

### Règles de travail de Rose pour ce projet
Vidéo YouTube : lire `~/.codex/YOUTUBE-AIRTABLE.md` et mettre à jour la fiche Airtable après chaque étape. Aucune dépense d'API IA externe sans accord.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `codex/seo-crm-capture-20260908` (attention : ce n'est pas forcément la branche de production)

- 5b4f221 2026-09-08 feat(seo): montrer le vrai tableau de bord CRM [skip actions]
- ec8a9b0 2026-09-08 feat(seo): relier la gestion micro-creche au CRM [skip actions]
- 2ffdd5a 2026-09-08 docs(seo): ajouter les volumes Google des mots clés [skip actions]
- 301e0b0 2026-09-08 docs(seo): préciser le positionnement concurrentiel [skip actions]
- 5c83766 2026-09-08 docs(seo): approfondir la stratégie 90 jours [skip actions]

### Ce qui manque encore à un successeur
- Branche locale `codex/seo-crm-capture-20260908` : branche de production et URL À compléter.
- Pas de CHANTIERS.md lu à la racine.
