# Chantiers transverses

[← Accueil](../README.md)

Chantiers qui touchent plusieurs projets. Statut initial : à lancer (sauf mention).

## 1. Automatisations auto-réparatrices
Au lieu d'envoyer une notification d'échec, l'automatisation diagnostique et corrige elle-même (puis rend compte).
- Premier cas : **veille CCN hebdomadaire** (cf. décision du 19/10 sur la Vigie CCN avec agent réparateur).
- Étendre ensuite aux SEO, retours DSN, etc.
- [ ] Définir ce qui peut être corrigé seul et ce qui exige la validation de Rose.

## 2. Détection des tâches déterministes à automatiser entièrement
- [ ] Repérer dans les sessions Claude/Codex les tâches répétées à l'identique (voir [tâches répétitives](taches-repetitives.md)).
- [ ] Les transformer en scripts ou automatisations sans IA quand c'est possible.

## 3. DataPaie : tests de non-régression automatisés
- [ ] Rejouer le calcul sur ~10 000 bulletins réels.
- [ ] Produire un rapport d'écarts (bulletin, rubrique, valeur attendue / obtenue).
- [ ] Brancher sur le processus de mise en ligne (validation de Rose obligatoire).
- À compléter : source des bulletins, anonymisation / RGPD, seuil de tolérance.

## 4. Gestion automatisée de la boîte mail
- Base existante : tâche `suivi-emails` (Plateforme de pilotage), skill `mail-perso`.
- [ ] Tri, réponses types, relances automatiques.

## 5. Optimisation de l'usage de l'IA
- [ ] Réduire les reprises après limite de quota.
- [ ] Supprimer les automatisations obsolètes ou en doublon ([liste](../automatisations/README.md)).
- [ ] Choisir Claude ou Codex par type de tâche.

## 6. Synchronisation automatique des conversations Claude/Codex dans le wiki
- [ ] Résumer chaque session et l'écrire dans `conversations/<projet>/AAAA-MM-JJ.md`.
- [ ] Mettre à jour la page projet (statut, prochaines étapes).
- [ ] Filtrer tout secret avant écriture.
