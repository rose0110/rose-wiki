# SmartDataPay (application)

[← Index des projets](README.md)

## Description

Application SaaS de paie : CCN, référentiel paie, formations SILAE, boutique de livres, MCP SILAE.

## Statut

Très actif (2 348 sessions, plus de 70 worktrees, activité le 19/10/2026).

## Chemins locaux (PC Windows)

- `Downloads\Python\smartdatapay-app`

## Dépôts GitHub connus

- [SDP-Conventions-API-Docs](https://github.com/rose0110/SDP-Conventions-API-Docs) *(à confirmer)*
- [CHAT-PDF-POUR-SMART-DATA-PAY](https://github.com/rose0110/CHAT-PDF-POUR-SMART-DATA-PAY) *(à confirmer)*
- [simulations-sdp](https://github.com/rose0110/simulations-sdp) *(à confirmer)*

## Outils

Claude + Codex

## Automatisations liées

- Suivi Codex sur VPS (VPS-PROJECTS.json)
- Tâches liées au référentiel / CCN (voir Vigie CCN)
- Surveillance-ventes-livres (toutes les heures) — rattachement à confirmer

## Prochaines étapes

- [ ] Remise OpenPaye (« openpaye-discount-activation »)
- [ ] MCP SILAE : Rose le recherchait le 19/10 — retrouver le dossier/dépôt
- [ ] Définir l'offre commerciale du MCP SILAE (sujet Codex de septembre sans suite visible)
- [ ] Nettoyer les worktrees non fusionnés

## Contacts / clients

—

## À compléter

- Dépôt principal de l'application ?
- Emplacement exact du MCP SILAE
- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\smartdatapay-app`
- Dépôt distant : https://github.com/Smart-Data-Pay-AI/smartdatapay-app.git

### Stack technique
Next.js (JavaScript/TypeScript), Supabase (base + auth), Stripe, Resend (emails), Sentry, Vercel (région cdg1). Nombreux scripts CCN / référentiel paie (`scripts/ccn/`, `scripts/payroll-reference/`).

### Lancer en local
`npm ci` puis `npm run dev` (port 3010). Copier `.env.example` vers `.env.local` avec des valeurs de test. Attention : la commande `build` passe par `scripts/ccn/c09/run-zero-external-ai.mjs` (protection contre les appels IA payants).

### Tester
`npm run lint`, tests ciblés `node --test` (`npm run test:documents`, `test:payroll-reference`, `test:calendrier-procedure`…). ~20 workflows GitHub Actions (`.github/workflows/` : e2e, ccn-security, payroll-reference, deploiement-a-jour, chantier-completion-guard, alertes-controles…).

### Déployer / mettre en ligne
Vercel, déploiement Git automatique **désactivé** sur `master` (vercel.json) : mise en ligne par la procédure du projet (skill `deploy-vercel-sur`, « arbitre de fraîcheur », un seul déploiement à la fois). **Projet de Rose : rien ne part en production sans son go** (règle 19), sauf demande explicite déjà formulée par elle (règle 32). Preuve en production (www) exigée après chaque mise en ligne.

### Services externes
Supabase, Stripe, Resend, Sentry, Vercel, OpenAI / Perplexity / Tavily / SerpAPI (recherche), ChatPDF, Elasticsearch, Airtable, PISTE (API Légifrance), SuperPDP (facturation électronique), YouTube API, Telegram (webhook). ELENET = source CCN commune.

### Variables d'environnement (noms seulement)
AIRTABLE_API_KEY, AI_BUDGET_* (DAILY_USD, MONTHLY_USD, USER_DAILY_USD, ENABLED), CCN_GENERATION_PATH, CCN_RESOLVER_ACTOR_HMAC_SECRET, CCN_SYTHESE_ENDPOINT, CHATPDF_API_KEY, CHATPDF_BASE, EINVOICING_PROVIDER, ELASTIC_SEARCH_CLOUD_ID / END_POINT / KEY, FORMATION_CLE_COMMUNAUTE, GOOGLE_API_KEY, NEXT_PUBLIC_CONTACT_MAIL_TO, NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_SHOW_RECENT_DISCUSSIONS, NEXT_PUBLIC_SIMULATION_MAIL_TO, OPENAI_API_KEY, PERPLEXITY_API_KEY, PISTE_GOUV_BASE_URL / CLIENT_ID / CLIENT_SECRET / OAUTH_BASE, RESEND_API_KEY, SEARCH_API_KEY, SENTRY_AUTH_TOKEN / DSN / ORG / PROJECT, SERPAPI_API_KEY, STRIPE_CLIENT_PORTAL_KEY, STRIPE_HEALTHCHECK_IGNORE_CUSTOMERS, STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_CONNECTION_URL, SUPABASE_PRIVATE_KEY, SUPABASE_ROOT_KEY, SUPABASE_URL, SUPERPDP_API_URL / CLIENT_ID / CLIENT_SECRET / ENV / SANDBOX_ENABLED, SUPPORT_AGENT_MODE, SUPPORT_INTERNAL_SECRET, SUPPORT_PROBE_BASE_URL, TAVILY_API_KEY, TELEGRAM_WEBHOOK_SECRET, VERCEL_ENV, YOUTUBE_API_KEY, YOUTUBE_DEFAULT_CHANNEL_ID (source : `.env.example`)

### Chantiers en cours
- `CHANTIERS.md` (créé le 19/09/2026) : nombreuses PR ouvertes (#398 dictée passerelle IA, #394 API partenaire synthèses, #391 référentiel lisible, #343 formation Premium, #302/#292 modèles, #285/#280 CCN C06/C09, #141 SMIC/PMSS…) — à revérifier avec `gh pr list`.
- 05/10 : Actualités CCN / import BOCC en prod ; PR #616 (recherche bornée) et #617 (filtre Étendus/Non étendus + rattrapage base de prod) en attente du go de Rose ; 1er envoi réel de la « lettre du lundi » en attente de son go écrit.
- 13/10 (`PROJECT-HANDOFF.md`) : formation **Freelance Paie** en cours d'intégration (copie sur VPS, branche `codex/freelance-paie-integration-20261013`).
- Voir aussi la page : remise OpenPaye, MCP SILAE, nettoyage des worktrees.

### Règles de travail de Rose pour ce projet
Pas de `CLAUDE.md` à la racine du dossier lu (un dossier `smartdatapay-claude-md` existe à côté : à vérifier). Règles globales de Rose : voir [continuité](../continuite.md). Règle de coût : jamais d'appel IA payant avec les clés du projet pour les traitements CCN massifs (tokens de session uniquement). Ne jamais lancer de travail lourd sur le PC de Rose : il passe sur le VPS (`atelier-smartdatapay`).

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `codex/fix-health-check-anomalies-20260906` (attention : ce n'est pas forcément la branche de production)

- 7ddacf84c 2026-09-09 fix(auth): préserver la configuration Supabase du navigateur
- 1c6938809 2026-09-06 security: neutraliser le workflow malveillant sur la branche locale [skip ci]
- 75a450342 2026-09-06 fix: fiabiliser le health-check quotidien
- 1ae567deb 2026-09-05 fix(payroll): attest CLI deployment SHA in watchdog [skip ci]
- 0721f11a7 2026-09-05 fix(payroll): allow gate signing key rotation [skip ci]

### Ce qui manque encore à un successeur
- Le dépôt est chez l'organisation GitHub **Smart-Data-Pay-AI** (pas rose0110) : vérifier les accès du successeur.
- Branche de production exacte (main/master ?) et URL de prod : À compléter.
- Pas de CLAUDE.md lu à la racine ; procédure `deploy-vercel-sur` décrite dans un skill local (~/.claude), pas dans le dépôt.
