# Plateforme de pilotage

[← Index des projets](README.md)

## Description

Suivi personnel centralisé de Rose (plateforme-pilotage.vercel.app). Répond déjà en partie au besoin de centralisation.

## Statut

Actif (18/10/2026).

## Chemins locaux (PC Windows)

- `Python\plateforme-pilotage`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude

## Automatisations liées

- suivi-emails
- suivi-facteur

## Prochaines étapes

- [ ] Articuler avec ce wiki (éviter deux sources de vérité)

## Contacts / clients

—

## À compléter

- Dépôt GitHub ?
- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\plateforme-pilotage`
- Dépôt distant : codex-vps:depots/plateforme-pilotage.git

### Stack technique
Next.js + React, Drizzle ORM, PostgreSQL (PGlite en local), SDK Anthropic, Playwright/Vitest, Vercel (prévu). Dépôt git sur le VPS (`codex-vps:depots/plateforme-pilotage.git`), pas sur GitHub.

### Lancer en local
Lire `README.md` (« Démarrer sur un poste nu ») : `npm install`, `npm run dev` (port 3025).

### Tester
`npm run verifier:tout` (typecheck + tests + ingestion à sec), `npm run test:e2e`.

### Déployer / mettre en ligne
Mise en ligne (Vercel + base d'août, accès privé) **attend le go de Rose**. Sauvegarde : `npm run sauvegarder`.

### Services externes
Anthropic (IA), PostgreSQL, Vercel ; prévu : Telegram (urgences), boîtes mail (lecture + brouillons validés).

### Variables d'environnement (noms seulement)
ANTHROPIC_API_KEY, DATABASE_URL, PILOTAGE_CODE, PILOTAGE_MODELE, PILOTAGE_SECRET_SESSION (source : `.env.example`) ; Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`CHANTIERS.md` — 1. « Le suivi, refait » (ouvert le 17/10) : écrans faits et prouvés en essai ; remplissage automatique (tâche planifiée à créer), Telegram (robot + accord de Rose), boîtes Google à relier par Rose, mise en ligne au go de Rose.

### Règles de travail de Rose pour ce projet
Principe : on ne demande jamais à Rose de **remplir**, on lui demande de **trancher** ; elle saisit quand elle le décide (champ « en vrac »). Le dépôt contient de la matière stratégique : uniquement vers un dépôt **privé**.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `chantier/plateforme-pilotage` (attention : ce n'est pas forcément la branche de production)

- 7847aad 2026-10-17 Passation : suivi en ligne, preuves, tâches planifiées, refus du garde-fou
- 4eb0386 2026-10-17 Suivi : le bouton dit « Valider le texte » (l'envoi automatique n'est pas branché)
- 7864ff2 2026-10-17 Facteur : commande alimenter pour les envois déjà formés (e-mails)
- 347cc1f 2026-10-17 Mise en ligne : n'envoyer que le code utile (ni bases, ni identifiants, ni analyses d'août)
- ab90ce7 2026-10-17 Passation : état du suivi refait, incident du serveur d'essai, ce qui attend Rose

### Ce qui manque encore à un successeur
- Dépôt uniquement sur le VPS : accès SSH du successeur À compléter.
- Pas encore en ligne.
