# Site Smart Data Pay

[← Index des projets](README.md)

## Description

Site vitrine.

## Statut

Actif (19/10/2026).

## Chemins locaux (PC Windows)

- `Python\smart-data-pay-site`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude

## Automatisations liées

- Aucune connue.

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
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\smart-data-pay-site`
- Dépôt distant : https://github.com/rose0110/smart-data-pay-site.git

### Stack technique
React + Vite, Express + tRPC, Drizzle, Supabase, Resend, Vercel (fonctions `api/*` autonomes).

### Lancer en local
`pnpm install` puis `pnpm dev`.

### Tester
`npm run juge` = typecheck + tests + build + `verif:discours` (contrôle des affirmations du site) ; workflow `juge-discours.yml`. Garde-fou : les fonctions Vercel ne doivent importer aucun paquet npm (test dans `server/demoCollective.test.ts`).

### Déployer / mettre en ligne
Vercel : déploiement « staged » (`--skip-domain`) puis `vercel promote` après preuve ; projet de Rose = go requis (ex. go « publie » du 16/09).

### Services externes
Supabase, Resend, Vercel ; Umami (script mort à retirer ou configurer).

### Variables d'environnement (noms seulement)
ADMIN_NOTIFICATION_EMAIL, EMAIL_FROM, RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL (source : `.env.example`) ; Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`CHANTIERS.md` : aucun chantier ouvert. Idées en attente : clé Resend « envoi seulement » dédiée, script Umami mort, choix du domaine (.com). `main` local porte 2 commits « tarifs » du 19/09 **non poussés** (à vérifier).

### Règles de travail de Rose pour ce projet
Aucune adresse email de Rose publiée sur le site : formulaire de contact uniquement. Pas de « bonne nouvelle » ni de ton vendeur dans les textes.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `main` (attention : ce n'est pas forcément la branche de production)

- cd9cd94 2026-09-19 feat(tarifs): reorganisation en 3 blocs + envoi email/signature/tableau de bord pour tous
- 2403bd5 2026-09-19 feat(tarifs): Essentiel enrichi — documents 5/mois + controle de paie 3/mois ; ajout signature electronique et personnalisation des modeles (Cabinet/Premium)
- 0198250 2026-09-17 fix(contact): validation manuelle sans zod (paquet non embarque au runtime Vercel -> FUNCTION_INVOCATION_FAILED)
- cc40b43 2026-09-17 feat(contact): formulaire de contact -> Supabase + email (fin de Make.com)
- 928140c 2026-09-16 docs(handoff): site « De la question à l'action » en production (a85c9ce, dpl_4MAgVhvpqLW8PEqK6xC2v3DxHTwR), preuves prod, chantier sorti de la file

### Ce qui manque encore à un successeur
- Commits locaux non poussés sur `main` : risque de perte si le PC est indisponible.
- Boîte contact@ non prouvée ; test Safari iPhone non fait.
