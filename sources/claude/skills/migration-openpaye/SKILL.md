---
name: migration-openpaye
description: Migrer un dossier de paie d'un client (Cegid, Silae…) vers OpenPaye via l'espace de collecte Innov'Paie — pilote intelligent qui lance des scripts déterministes, accès client jamais vus, questions au client par la plateforme, fiches de paramétrage renseignées et contrôlées par DSN d'essai, et journal des leçons qui apprend à chaque dossier. À charger dès qu'on parle de migration OpenPaye, de reprise de dossiers, de SOCOGERCO / M. LE FLEM, de fiches de paramétrage DSN, de cumuls de reprise, de DSN d'amorçage, ou qu'un client a déposé ses pièces dans l'espace de collecte.
---

# Migration vers OpenPaye — le pilote

Décision Rose du 22/10/2026 : « ton système doit être auto-apprenant […] le pilote sera intelligent et va lancer des
scripts déterministes pour ne pas gaspiller les tokens […] on va d'abord faire les 500 premiers dossiers ensemble ».

## Avant de toucher un dossier (obligatoire)
1. `git pull` dans `C:\Users\roses\Downloads\Python\automationopenpaye` (dépôt de suivi partagé avec atelier-paie).
2. Lire, dans `migration-openpaye/docs/` :
   - `04-methode-pilote.md` — les 13 étapes, qui fait quoi, l'outil et le contrôle de sortie de chacune ;
   - `05-fiches-parametrage.md` — méthode Daouda, table des correspondances caisse → rubriques, les 9 contrôles ;
   - `06-lecons.md` — décisions de Rose, pièges OpenPaye, écarts attendus, mes oublis passés.
3. Lire l'entrée du chantier dans `PROJECT-HANDOFF.md` et dans `~/.claude/chantiers-pilote/REGISTRE.md`.

## Pendant
- Préférer un script ou une consigne JSON existants (`migration-openpaye/outils`, `consignes/`) à un raisonnement.
  Un geste fait deux fois à la main devient un script.
- Accès client : uniquement par les outils `outils/serveur/*` (déchiffrement en mémoire dans le conteneur API).
  Ne jamais voir, saisir ni demander un mot de passe.
- Questions : Rose d'abord ; le reste sur la plateforme, dans le dossier, en heures ouvrées, texte montré à Rose.
- « Paramétré » ne se dit qu'après `controle_dsn.sh` sans contrôle rouge (ou écart expliqué et posé en question).

## Après (c'est ce qui rend le système apprenant)
- Toute erreur, tout bug OpenPaye, tout oubli, toute correction ou décision de Rose → une ligne dans `06-lecons.md`
  (ce qui s'est passé → la règle → le garde-fou), dans le même commit que la correction.
- Toute nouvelle correspondance fiche → rubriques → table de `05-fiches-parametrage.md`.
- Passation et registre à jour ; commit + push du dépôt de suivi.
