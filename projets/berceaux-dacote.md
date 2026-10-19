# Berceaux d'à Côté (CRM + site)

[← Index des projets](README.md)

## Description

CRM de la micro-crèche de Dourdan (contrats, devis, accès) et site lesberceauxdacote.com.

## Statut

Actif (27 et 2 sessions, 19/10/2026).

## Chemins locaux (PC Windows)

- `Python\berceaux-crm`
- `Python\berceaux-dourdan`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude + Codex

## Automatisations liées

- envoi-reponse-alicia-berceaux, visite-creche-alicia-ismael (ponctuelles, dates passées ?)
- Codex : publications Berceaux (Facebook)

## Prochaines étapes

- [ ] Nouveau chantier application mobile (17/10)
- [ ] Point sur les avenants de contrat
- [ ] Notification mail à chaque inscription

## Contacts / clients

Alicia, Ismael (familles ?) — à confirmer

## À compléter

- Dépôt du CRM (recherché plusieurs fois dans Codex)
- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\berceaux-crm`
- Dépôt distant : https://github.com/rose0110/berceaux-crm.git

### Stack technique
CRM : React + Vite, Express + tRPC, Drizzle, MySQL (historique) / migration, Vercel Blob, S3, nodemailer ; branche `app-mobile` (application mobile en cours). Site : `Downloads\Python\berceaux-dourdan` (même pile, base PostgreSQL/Supabase après migration TiDB), dépôt github.com/rose0110/berceaux-dourdan.

### Lancer en local
`pnpm install` puis `pnpm dev` (dans chaque dépôt).

### Tester
`pnpm check`, `pnpm test` (Vitest, ~970 tests verts sur le CRM au 17/10).

### Déployer / mettre en ligne
Vercel (déploiement promu après contrôle de fraîcheur). Projet de Rose : go requis (ex. « EN LIGNE le 17/10 à 18 h 38, go de Rose »). Les mails aux familles / candidates ne partent que sur accord explicite de Rose.

### Services externes
Vercel (+ Blob), base MySQL/PostgreSQL (Supabase pour le site), S3, SMTP/nodemailer, Facebook (publications via Codex).

### Variables d'environnement (noms seulement)
À compléter (pas de `.env.example` dans les deux dépôts). Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`CHANTIERS.md` / `PROJECT-HANDOFF.md` du CRM :
- Accélération du CRM : en ligne le 17/10 ; reste à reparcourir les écrans connectés.
- Planning (absences, intérimaires, PDF) et horaires libres : en production les 18 et 19/10 (preuves sur des branches `codex/planning-*`).
- Application mobile (branche `app-mobile`, commits du 17/10) : en cours.
- Site : offre d'emploi EJE en CDI et formulaire de candidature (17/10).

### Règles de travail de Rose pour ce projet
Données de familles et de salariées : ne jamais les recopier dans le wiki ni dans des tests. Preuves dans `docs/chantier/preuves/`.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `app-mobile` (attention : ce n'est pas forcément la branche de production)

- 93a292a 2026-10-17 feat(app mobile): accueils acceptes reportes sur la facture du mois
- 6ac3280 2026-10-17 feat(app mobile): API des trois publics
- b22aa79 2026-10-17 feat(app mobile): fondations serveur (tables, perimetre salariee)
- 5d93099 2026-10-17 docs(app mobile): maquette reprise a la charte Micro-Creche Facile
- 4002785 2026-10-17 docs(app mobile): cadrage valide avec Rose et maquette des ecrans

### Ce qui manque encore à un successeur
- Pas de `.env.example` : variables À compléter.
- Plusieurs états de production consignés sur des branches distantes/worktrees séparés : point d'entrée unique À compléter.
