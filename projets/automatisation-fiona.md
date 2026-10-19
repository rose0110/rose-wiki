# Automatisation Fiona

[← Index des projets](README.md)

## Description

Projet client : automatisation OpenPaye vers SharePoint, maquette mobile, contrat de sous-traitance.

## Statut

Actif (18 sessions, plus de 10 worktrees, 19/10/2026).

## Chemins locaux (PC Windows)

- `Downloads\Python\Automatisation-Fiona`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude

## Automatisations liées

- Aucune connue.

## Prochaines étapes

- [ ] Finaliser le contrat de sous-traitance

## Contacts / clients

Fiona (cliente) — coordonnées à compléter

## À compléter

- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\Automatisation Fiona`
- Dépôt distant : **aucun dépôt distant** (git local uniquement)

### Stack technique
Dossier documentaire (git local) + application HUP-RH : `openpayesharepoint-api` et `openpayesharepoint-web` (son `.git` sert à ~30 worktrees). Hébergé sur un serveur du client (pile conteneurs, sauvegardes serveur).

### Lancer en local
À compléter (voir `ACCES-SERVEUR.md` et la note `hup-prod-deploiement` : **sans recopier d'accès dans le wiki**).

### Tester
À compléter.

### Déployer / mettre en ligne
**Logiciel client déjà en ligne (HUP)** : un bug bloquant (DSN rejetée, fonction qui ne répond plus) se corrige et se met en ligne **sans attendre le go de Rose**, correctif minimal/complet/testé, Rose prévenue immédiatement avec preuve (règle 19). Les **améliorations** attendent le go de Rose.

### Services externes
OpenPaye, SharePoint/Microsoft 365, serveur client (Adminer fermé à Internet le 17/10/2026).

### Variables d'environnement (noms seulement)
À compléter. Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`PROJECT-HANDOFF.md` :
- **Engagements du 15/11/2026** : plan `contrats/engagements-15-11-plan.md`, scripts préparés mais NON exécutés (bascule des accès serveur, sauvegarde, effacement des copies réelles).
- Notification à HUP à faire sous 48 h suite à la fermeture d'Adminer (17/10).
- Effacement définitif de copies réelles sur le PC : à confirmer par Rose elle-même.
- Contrat de sous-traitance RGPD : audit du 15/10 dans `contrats/` (v2 à reprendre).

### Règles de travail de Rose pour ce projet
Ne JAMAIS supprimer `openpayesharepoint-api` en bloc (son `.git` sert aux worktrees). Ton des mails à la cliente : factuel, amical, jamais « bonne nouvelle » (règle 13).

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `master` (attention : ce n'est pas forcément la branche de production)

- 0def04d 2026-08-09 Poser un dépôt sur le dossier HUP-RH : les documents, et rien d'autre

### Ce qui manque encore à un successeur
- Aucun dépôt distant pour le dossier ; remotes des sous-dépôts api/web : À compléter.
- Procédure de déploiement HUP détaillée : dans une note locale, À compléter dans le wiki (sans secrets).
- Coordonnées de la cliente : À compléter.
