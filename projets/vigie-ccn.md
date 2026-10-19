# Vigie CCN / veille CCN (ELENET, KALI)

[← Index des projets](README.md)

## Description

Surveillance automatique des conventions collectives et agent réparateur.

## Statut

En cours de mise en place (décision du 19/10/2026, essais réels).

## Chemins locaux (PC Windows)

- `Python\vigie-ccn`
- `Python\ELENET`
- `Downloads\Python`

## Dépôts GitHub connus

- [syntheses_ccn](https://github.com/rose0110/syntheses_ccn) *(à confirmer)*
- [ccn-conventions-collectives](https://github.com/rose0110/ccn-conventions-collectives) *(à confirmer)*

## Outils

Claude + Codex

## Automatisations liées

- Nombreuses tâches qui se recoupent : voir automatisations/README.md
- Skills veille-ccn-kali, vigie, refonte-ccn

## Prochaines étapes

- [ ] Consolider les doublons Claude/Codex
- [ ] Passer à une veille auto-réparatrice (voir chantiers transverses)
- [ ] rappel-reecriture-fiches-ccn le 01/12/2026

## Contacts / clients

—

## À compléter

- ELENET scraping : laissé en plan ?
- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\vigie-ccn`
- Dépôt distant : **aucun dépôt distant** (git local uniquement)

### Stack technique
Python (`vigie.py`, contrôle déterministe sans IA), tâche planifiée Windows « Vigie CCN » (toutes les heures), agent réparateur `claude -p` (consigne `REPARER.md`). Chaînes surveillées : ELENET (`Downloads\Python\ELENET`, Node + Python, **sans git**), KALI (`kali-watcher`, github.com/rose0110/kali-watcher), CCN SmartDataPay.

### Lancer en local
`python vigie.py` ; installation de la tâche : `installer_tache.ps1`.

### Tester
`python -m unittest discover -s tests` (faux journaux dans `tests/faux`).

### Déployer / mettre en ligne
Pas de mise en ligne : tourne sur le PC de Rose (tâche planifiée).

### Services externes
ELENET (API Supabase `elenet_sections`), Légifrance/KALI, CLI Claude (agent), email (prévenir Rose).

### Variables d'environnement (noms seulement)
Jeton de l'agent attendu dans `~/.secrets/claude-vigie.env` (nom : `CLAUDE_CODE_OAUTH_TOKEN`) ; Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`PROJECT-HANDOFF.md` (19/10) : construit et essayé ; **bloquant** : la CLI Claude autonome n'est pas connectée sur le PC, l'agent ne peut pas se lancer tant que le jeton n'est pas posé (autorisation de Rose). Une intervention réelle de l'agent n'a pas encore été observée.

### Règles de travail de Rose pour ce projet
`CLAUDE.md` de `Downloads\Python` : pour ELENET, lire `html_content` pour toute section contenant un tableau (`text_content` seulement pour du texte simple). ELENET n'a pas de git : l'agent corrige avec une copie `.bak-AAAAMMJJ-HHMM`.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `master` (attention : ce n'est pas forcément la branche de production)

- e0714db 2026-10-19 Vigie CCN : controle horaire des 3 chaines CCN, relances, agent reparateur, courriels

### Ce qui manque encore à un successeur
- Aucun dépôt distant (vigie-ccn) et ELENET sans git du tout : risque de perte.
- Dépendance au PC de Rose (tâche planifiée locale).
