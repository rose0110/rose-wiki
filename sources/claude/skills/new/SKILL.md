---
name: new
description: >
  Suggère automatiquement la ou les prochaines tâches à lancer sur le projet courant,
  sans que Rose ait à les chercher elle-même. À invoquer par /new (ou quand
  Rose demande « je fais quoi maintenant ? », « propose-moi la suite », « quelle est la
  prochaine tâche ? »). Le skill lit l'état RÉEL (mémoire persistante, git, PRs, tâches,
  fichiers de reliquats) et rend un top 3 priorisé avec, pour chaque tâche, un prompt
  prêt à lancer — Rose n'a plus qu'à dire « go 1 ».
---

# Prochaine tâche — suggestion automatique

Tu es le chef d'équipe qui prépare le planning. Rose ne veut PAS chercher elle-même la
prochaine tâche : tu la trouves, tu la justifies, tu la rends lançable en un mot.

## Étape 1 — Collecter l'état réel (ne rien inventer)

Fais ces lectures EN PARALLÈLE (celles qui existent ; ignore silencieusement les absentes) :

1. **Mémoire persistante du projet** : `MEMORY.md` du répertoire memory (déjà en contexte)
   + ouvre les 2-3 fiches marquées « Actif / en cours » ou « état courant / handoff ».
   Cherche les mentions **RESTE**, **⏳**, **à faire**, **chantier parké**, **NO-GO**.
2. **Git** : `git log --oneline -15` + `git status --porcelain | head` + `gh pr list --state open`
   (PR ouvertes = travail à finir ou à merger).
3. **Tâches de session** : TaskList (tâches pending/in_progress non soldées).
4. **Fichiers de reliquats** s'ils existent à la racine ou dans docs/ : `TRIAGE-*.json`,
   `*-A-PRECISER.md`, `TODO*.md`, récaps HTML avec une section « reste ».
5. **CLAUDE.md du projet** : contraintes et points d'arrêt (ce qui exige Rose).

## Étape 2 — Prioriser (grille fixe)

Classe les candidats par ce barème, dans l'ordre :

1. 🔴 **Sécurité / intégrité prod** (fuite, données fausses en prod, écart prod↔main non déployé).
2. 🟠 **Bloquant client / lancement** (un utilisateur réel est bloqué, une échéance légale approche —
   en paie : échéances DSN le 5/15 du mois, clôtures, bulletins du mois en cours).
3. 🟡 **Travail commencé non fini** (PR ouverte, chantier à 80 %, rapport généré mais non traité) —
   finir vaut mieux que commencer.
4. 🟢 **Dette / qualité** (tests, non-régression à refiger, données à backfiller).
5. ⚪ **Nouvelles features** — seulement s'il n'y a rien au-dessus.

Écarte d'office : ce qui exige un geste EXCLUSIF de Rose (ex. `vercel --prod`, dépôt DSN réel,
paiements) — ça se SIGNALE en une ligne à part (« à ton clic : … »), ça ne compte pas comme tâche.

## Étape 3 — Rendre le résultat (format fixe)

Présente EXACTEMENT ceci, court et décidable :

```
## À ton clic (gestes qui n'attendent que toi)
- … (0 à 2 lignes max, avec la commande exacte)

## Top 3 des prochaines tâches

### 1. <titre impératif court>  [priorité 🔴/🟠/🟡/🟢 · effort ~Xh]
Pourquoi maintenant : <1-2 phrases, factuelles, avec la source (fiche mémoire, PR, fichier)>
Prompt prêt : « <prompt autonome complet, lançable tel quel — mode chantier si gros> »

### 2. …
### 3. …

Dis « go 1 » (ou 2, 3) et je lance immédiatement.
```

Règles du rendu :
- **Jamais plus de 3 suggestions.** Trier tue la décision ; toi tu as déjà trié.
- Chaque « Prompt prêt » doit être AUTONOME (contexte, fichiers, critère de fin inclus) —
  si la tâche est grosse, propose plutôt : « je génère un prompt-chantier complet via /chantier ».
- Si Rose répond « go N » : lance la tâche N sur-le-champ, sans reposer de question.
- Si l'état est ambigu entre deux priorités, tranche toi-même et dis pourquoi en une ligne.
- Si VRAIMENT rien n'est en attente (rare) : dis-le honnêtement et propose 1 amélioration
  proactive tirée des audits/mémoire, pas une invention.

## Garde-fous

- Ne déclenche RIEN à l'étape 1-3 : tu suggères, Rose décide (« go N »).
- Les priorités légales paie (échéances DSN, clôtures) passent devant le confort technique.
- Ne propose jamais une tâche déjà faite : vérifie dans git/mémoire qu'elle est encore ouverte.
