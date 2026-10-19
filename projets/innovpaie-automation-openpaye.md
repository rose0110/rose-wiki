# Innov'Paie / Automation OpenPaye

[← Index des projets](README.md)

## Description

Automatisations OpenPaye du cabinet Innov'Paie : facturation Stripe du 16 du mois, alertes DSN, nouvelle fonction « HOPE » d'OpenPaye.

## Statut

Actif (70 sessions, activité le 19/10/2026).

## Chemins locaux (PC Windows)

- `Downloads\Python\automationopenpaye`

## Dépôts GitHub connus

- Aucun dépôt identifié avec certitude.

## Outils

Claude + Codex

## Automatisations liées

- verif-facturation-16-octobre-2026 (ponctuelle, date passée ?)
- Alertes DSN
- Suivi Codex sur VPS

## Prochaines étapes

- [ ] Intégrer HOPE (souhait du 19/10)

## Contacts / clients

Clients du cabinet Innov'Paie

## À compléter

- Dépôt GitHub de ce projet ?
- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\automationopenpaye`
- Dépôt distant : https://gitlab.com/rose.songue/automationopenpaye-suivi.git

### Stack technique
Plusieurs dépôts : `api`, `app`, `backoffice`, `documentation`, `migration-openpaye`, `devops`, `ops` + un « paquet » moteur (`moteur_central`, versions 0.11.x). Déploiement en conteneurs (podman) sur serveurs (« atelier » / prod via SSH), PostgreSQL. Le dossier racine est un dépôt de **suivi** (GitLab).

### Lancer en local
À compléter : chaque sous-dépôt a sa procédure ; les essais se font sur le VPS « atelier-paie » (règle : le PC n'est pas une machine de calcul).

### Tester
Suites API (~3 300 tests), app (~600), « juge » de documentation (19/19), bancs anti-IDOR et mutants ; verdicts GO/NO-GO testeur-qa et securite-rgpd. Procédures dans `chantiers/` (ex. `chantiers/hope/TRAIN-C9-CASES.md`).

### Déployer / mettre en ligne
Mode **train** : branches poussées sur GitLab, verdicts GO, puis **go de Rose** → fusion, image, mise en ligne, preuve (health 200, 0 erreur), rollback par image git précédente. Logiciel client déjà en ligne (HUP) : un bug bloquant se corrige sans attendre le go, Rose prévenue immédiatement avec preuve (règle 19).

### Services externes
OpenPaye (API + robots), PostgreSQL, Resend (emails), Vertex AI (région eu) pour l'assistant, GitLab, serveurs VPS.

### Variables d'environnement (noms seulement)
À compléter (pas de `.env.example` lu au niveau du dépôt de suivi ; voir chaque sous-dépôt). Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
`CHANTIERS.md` (règle 23, lu en premier à chaque session) :
- **ECHEANCES-RAPPELS** (live du 5/11) : branches `feat/echeances-rappels` poussées le 19/10, non fusionnées.
- **ALERTES-PAR-TYPE** (live du 5/11) : sujets d'alerte par utilisateur/cabinet, branches poussées, non déployées.
- **ALERTES-19-10** : moins de mails d'alerte à Rose, **en prod le 19/10**.
- Mini-train C9 « cases des bulletins » (paquet v0.11.0) : prêt, attend verdicts GO puis go de Rose.

### Règles de travail de Rose pour ce projet
Règles globales + : ne rien mettre en ligne hors train validé ; les supports clients passent par un brouillon montré à Rose avant envoi (« OK ENVOIE ») ; contrôles en base en lecture seule (READ ONLY) pour diagnostiquer.

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `main` (attention : ce n'est pas forcément la branche de production)

- 8b5c18a 2026-10-19 Live 5/11 : DAT intégrée — assistant retiré, adresses confirmées, SHA api 45652f9b / app ae5f52b / doc 6f2c35f
- eaf3974 2026-10-19 Live 5/11 : lecture console livrée, essai KAZAC par l'interrupteur après le train, paquet 0.11.1 lancé
- 185151d 2026-10-19 Échéances et rappels : lecture console livrée, essai KAZAC à lancer
- 0a53af6 2026-10-19 Live 5/11 : verdicts sécurité du 19/10 soir et décisions (outil DAT de l'assistant retiré)
- b3ccef1 2026-10-19 Échéances et rappels : lecture console (paquet seulement), préférences d'alertes branchées, restes

### Ce qui manque encore à un successeur
- Dépôt de suivi sur **GitLab (rose.songue)** : URL des sous-dépôts api/app/doc et accès SSH aux serveurs : À compléter.
- Procédure de lancement local : À compléter.
- Le PROJECT-HANDOFF contient des noms de clients/salariés : ne pas le recopier ailleurs.
