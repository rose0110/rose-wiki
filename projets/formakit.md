# FormaKit

[← Index des projets](README.md)

## Description

Formations.

## Statut

Actif — URL cassée (19/10/2026).

## Chemins locaux (PC Windows)

- `Python\formakit`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Codex

## Automatisations liées

- Suivi Codex sur VPS

## Prochaines étapes

- [ ] URGENT : rétablir l'URL

## Contacts / clients

—

## À compléter

- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\formakit`
- Dépôt distant : https://github.com/rose0110/formakit.git

### Stack technique
React + Vite (pré-rendu), serveur Express/esbuild, PostgreSQL 17 (Supabase), Stripe, Resend, Vercel (+ Blob), Node 22, pnpm 10.34.2.

### Lancer en local
`.env.example` → `.env` (valeurs locales), `pnpm install --frozen-lockfile`, `pnpm db:migrate`, `pnpm dev`.

### Tester
`pnpm check:secrets`, `check:claims`, `verify:compliance`, `check`, `test`, `build`, `verify:migrations`, `test:e2e:auth`, `test:e2e:of` (base dédiée non production). CI : `ci.yml`, `chantier-completion-guard.yml`.

### Déployer / mettre en ligne
Statut : **Preview de validation avec données synthétiques** ; commercialisation, paiements réels, emails réels et production fermés tant que l'identité légale, les CGV et les fournisseurs ne sont pas validés. Une URL annoncée publique se teste **sans session** (leçon du 19/10 : l'URL était cassée/redirigée vers la connexion Vercel).

### Services externes
Supabase/PostgreSQL, Stripe, Resend, Vercel (Blob).

### Variables d'environnement (noms seulement)
APP_URL, BILLING_MODE, BLOB_READ_WRITE_TOKEN, COMMERCIALIZATION_STATUS, CRON_SECRET, DATABASE_ENVIRONMENT, DATABASE_URL, DOCUMENT_STORAGE_MODE, EMAIL_FROM, EMAIL_PAYLOAD_ENCRYPTION_KEY, EMAIL_REPLY_TO, EMAIL_TRANSPORT, JWT_SECRET, L6353_11_REPORTING_MODE, L6353_12_DISCLOSURE_MODE, NODE_ENV, PLATFORM_SUPPORT_ENABLED, PORT, PUBLIC_ENROLLMENT_ENABLED, RESEND_API_KEY, RESEND_WEBHOOK_SECRET, SMTP_ENCRYPTION_KEY, STRIPE_PORTAL_CONFIGURATION_ID, STRIPE_SECRET_KEY, STRIPE_SOLO_PRICE_ID, STRIPE_TEAM_PRICE_ID, STRIPE_WEBHOOK_ENDPOINT_URL, STRIPE_WEBHOOK_SECRET, SUPABASE_DB_CA_CERT (source : `.env.example`) ; Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
Urgent au 19/10 : **rétablir l'URL FormaKit**. Branche locale `codex/stripe-live-launch` (ouverture des abonnements Stripe live, juillet) : statut de fusion À compléter. Pas de CHANTIERS.md lu.

### Règles de travail de Rose pour ce projet
Aucune promesse de certification Qualiopi ni de conformité automatique dans les textes.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `codex/stripe-live-launch` (attention : ce n'est pas forcément la branche de production)

- d68371d 2026-07-27 fix: identifier le vendeur dans les CGV pré-rendues
- 855c70f 2026-07-27 feat: ouvrir les abonnements Stripe live
- b6a52c1 2026-07-23 Merge pull request #5 from rose0110/codex/reprise-formakit
- 85b0561 2026-07-23 fix(auth): clarify account existence at sign-in
- f12b836 2026-07-23 docs: actualiser les preuves du candidat public

### Ce qui manque encore à un successeur
- Pas de PROJECT-HANDOFF / CHANTIERS à la racine.
- URL de production et état réel du lancement Stripe : À compléter.
