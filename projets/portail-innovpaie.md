# Portail Innov'Paie / site innovpaie.fr

[← Index des projets](README.md)

## Description

Portail client et site innovpaie.fr.

## Statut

Chantier ergonomie et identité du portail en cours ; Rose n'en est pas satisfaite (18/10/2026).

## Chemins locaux (PC Windows)

- `Python\portail-innovpaie`
- `Python\innovpaie`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude

## Automatisations liées

- Aucune connue.

## Prochaines étapes

- [ ] Poursuivre le chantier ergonomie/identité (PROMPT-CHANTIER dédié)

## Contacts / clients

Clients Innov'Paie

## À compléter

- Dépôt GitHub ? (innovpaie-congres concerne plutôt le Congrès)
- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\portail-innovpaie`
- Dépôt distant : https://github.com/rose0110/portail-innovpaie.git

### Stack technique
Next.js 16 (App Router), React 19, Tailwind 4, Supabase (Auth, PostgreSQL 17, RLS, Storage), Stripe, Resend, OAuth Microsoft/Google, Vercel. Site vitrine associé : `Downloads\Python\innovpaie` (Vite + Express, dépôt github.com/rose0110/innovpaie).

### Lancer en local
Node 22 + Docker Desktop + Supabase CLI 2.109.1 : `cp .env.example .env.local`, `npm ci`, `npm run db:start`, `npm run db:reset`, `npm run dev`. Lire `node_modules/next/dist/docs/` avant de coder (version de Next.js récente, cf. AGENTS.md).

### Tester
`npm run ci` = lint + typecheck + tests unitaires + `test:pricing` + `test:db` (Supabase) + build + E2E Playwright. Workflow `.github/workflows/ci.yml`.

### Déployer / mettre en ligne
Prod : https://portail.innov-paie.fr. Déploiement par **CLI Vercel** (l'intégration Git est morte). Rollback = promouvoir le déploiement précédent (pas de retour arrière silencieux). Projet de Rose : go de Rose requis.

### Services externes
Supabase, Stripe, Resend, OAuth Google & Microsoft, DataPaie (lecture seule), Paraf (signature, derrière validation humaine), Vercel.

### Variables d'environnement (noms seulement)
COMMERCIAL_SITE_URL, CRON_SECRET, DATAPAIE_DB_CA_CERT, DATAPAIE_DB_URL, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, MICROSOFT_OAUTH_CLIENT_ID, MICROSOFT_OAUTH_CLIENT_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_TICKETS_DOMAIN, PARAF_API_KEY, PARAF_API_URL, PORTAIL_CRON_DB_URL, PORTAIL_DB_CA_CERT, PORTAIL_ENC_MASTER_KEY, PORTAIL_REPLY_TO, PORTAIL_URL, RESEND_API_KEY, RESEND_WEBHOOK_SECRET, STRIPE_BILLING_PORTAL_CONFIGURATION_ID, STRIPE_PRICE_ABONNEMENT, STRIPE_SECRET_KEY, STRIPE_TAX_RATE_ID, STRIPE_WEBHOOK_SECRET, TICKETS_DOMAIN, TICKETS_FROM, VERCEL_OIDC_TOKEN (source : `.env.example`) ; Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`CHANTIERS.md` :
1. « Mes éditions du mois » : construit sur `feat/editions-du-mois`, pas de PR, pas en prod — **attend que Rose valide la forme**.
2. « Ce qui dépend de vous » en tête du portefeuille : non commencé.
3. Mails d'événements : non commencé.
- Défaut connu : en-tête de l'espace entreprise mal empilé sur mobile.
- Actions réservées à Rose : vérifier `STRIPE_PRICE_ABONNEMENT` (150 € HT/mois) ; poser la règle d'équipe « tout changement d'état réel est reporté le jour même ».

### Règles de travail de Rose pour ce projet
Règle du jeu : chaque écran répond à « où en sont mes paies ? · qu'est-ce qui dépend de moi ? · où sont mes éditions ? » ou disparaît. Onboarding manuel (plus de « 100 % autonome »). DataPaie en lecture seule.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `feat/editions-du-mois` (attention : ce n'est pas forcément la branche de production)

- 94f465a 2026-09-15 Merge main dans feat/editions-du-mois
- f74b456 2026-09-15 CHANTIERS : slides visuelles du congrès, défaut d'en-tête mobile côté entreprise noté
- 06c3a94 2026-09-15 Merge main (passation) dans feat/editions-du-mois
- 10e06e5 2026-09-15 Passation : seed démo rejoué en prod (15/09), slides congrès, file CHANTIERS.md
- 5b3b203 2026-09-15 Éditions du mois : page /editions, zip du mois, menu et onglets « Éditions » (WIP, en attente de validation de la forme)

### Ce qui manque encore à un successeur
- Le handoff date du 15/09/2026 : état après le congrès À compléter.
- Compte Vercel CLI utilisé et accès Supabase de prod : demander à Rose.
