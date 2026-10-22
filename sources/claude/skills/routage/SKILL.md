---
name: routage
description: Table de routage des modèles Claude Code (Fable 5 / Opus 4.8 / Sonnet 5 / Haiku 4.5) + niveaux d'effort — quel modèle et quel effort pour quelle tâche, dans TOUS les projets. À charger quand on conçoit un workflow multi-agents, qu'on délègue à des sous-agents, ou qu'on veut baisser le coût sans perdre en qualité (orchestrateur fort + exécutants moins chers). Règle d'or encodée : ne JAMAIS router vers le bas la gate finale de justesse sur un sujet à enjeu (argent, droit, sécurité, prod, données).
---

# Routage des modèles & effort — mode d'emploi (tous projets)

## Le principe
Le modèle n'est pas le moat, le **process** l'est. Un orchestrateur fort qui délègue à des
exécutants moins chers donne **~le même résultat** qu'un orchestrateur fort qui délègue à des
exécutants forts — pour **une fraction du coût** (constat récurrent : ×3 à ×10 d'économie à
qualité égale). Donc : garder l'**intelligence là où elle décide et vérifie**, router vers le
**bas là où ça exécute**.

## La boîte à outils (relatif, pas des chiffres inventés)
Coût croissant : **Haiku ≪ Sonnet < Opus < Fable**. « Goût » = créativité / design / sortir du cadre.

| Modèle | Coût | Intelligence | Goût | Rôle type |
|---|---|---|---|---|
| **Haiku 4.5** | ★ (le moins cher) | ★★ | ★★ | Scouts, lecture/grep, extraction, tâches mécaniques répétées, premier tri |
| **Sonnet 5** | ★★ | ★★★★ | ★★★ | Exécution standard, code de routine, tests, refactors cadrés, synthèse |
| **Opus 4.8** | ★★★★ | ★★★★★ | ★★★★ | Orchestration, raisonnement dur, revue critique, décisions, gates de justesse |
| **Fable 5** | ★★★★★ | ★★★★★ | ★★★★★ | Design/UI/UX, problèmes ouverts, planification adverse, quand le goût compte |

Au-delà de Claude : pour le **volume ingrat** (gros builds mécaniques), on peut déléguer hors
Claude (Codex, modèles locaux) et garder Claude pour la justesse métier + la revue (cf. règle 9D
du CLAUDE.md global).

## Router par type de tâche
- **Orchestrer / décider / arbitrer** → Opus (ou Fable si le goût compte). C'est le cerveau qui
  planifie, distribue, relit et resynthétise.
- **Chercher / lire / grep / extraire / trier** → **Haiku**. Un `Explore` de code, un scout de
  doc, un premier balayage : inutile d'y mettre Opus.
- **Exécuter du code de routine, écrire des tests, refactor cadré** → **Sonnet**.
- **Design, UI/UX, copie créative, problème vraiment ouvert** → **Fable** (ou Opus/high).
- **Vérifier / réfuter / gate finale** → **Opus (effort haut)**. Jamais en dessous (voir règle d'or).

## Niveaux d'effort (low / medium / high / xhigh / max)
Décision Rose du 17/10/2026, d'après Matt Pocock (entretien chez Nate Herk) : la plupart des gens
mettent trop d'effort. Quand l'environnement est bon (tests, contrôles automatiques, agent qui voit
l'application), un effort moyen suffit, répond plus vite et coûte moins.
- `low` = mécanique, lecture, plomberie.
- `medium` = **défaut pour le travail courant** : écrans, code de routine, documents, recherche,
  rédaction, tri. Les tests et contrôles rattrapent les erreurs.
- `high` = obligatoire pour ce qui touche à l'argent ou au droit et doit être JUSTE : calcul de
  paie, règle juridique, sécurité et données, migration, mise en ligne, gate finale de revue.
- `xhigh` / `max` = seulement pour un point vraiment retors. **Attention : plus d'effort n'est pas
  toujours mieux** — au-delà d'un seuil, le modèle se sur-réfléchit, se contredit, part trop long
  et sort **pire** que `high`. Monter d'un cran seulement si `high` a visiblement calé.

## Appliquer concrètement dans Claude Code
- **Sous-agent (outil Agent)** : `model: 'haiku' | 'sonnet' | 'opus' | 'fable'`.
- **Workflow** : chaque `agent(prompt, { model, effort })` — mets les stages de scan/mécanique en
  `{model:'haiku', effort:'low'}` et les stages de verify/judge en `{model:'opus', effort:'high'}`.
  Le patron gagnant : **Opus orchestre, Haiku/Sonnet exécutent et rapportent, Opus re-décide.**
- **Session** : `/model` pour changer le modèle courant, `/fast` pour Opus en sortie rapide (même
  gamme, plus véloce).
- Par défaut, un `agent()` sans `model` hérite du modèle de session — ne surcharge que quand tu es
  sûre qu'un autre palier convient.

## RÈGLE D'OR (la ligne rouge — ne jamais la franchir)
**La gate qui laisserait passer une réponse fausse à conséquence coûteuse reste sur un modèle fort
et un effort haut.** On route vers le bas l'exploration, jamais la validation finale. Selon le
domaine, la gate à protéger :
- **Paie / finance** : le recalcul au centime + le sourcing juridique (jamais Haiku/Sonnet dessus).
- **Sécurité / données** : l'audit de fuite, la revue d'accès, la migration prod.
- **Code critique** : la revue de correctness/sécurité qui précède un merge/deploy.
- **Recherche** : la vérification adverse des faits/sources avant de conclure.
Économiser des tokens sur une de ces gates ne vaut jamais le coût d'une erreur qui passe.

## Habitude de scoping adverse (avant de router)
Avant de découper et distribuer : ne pas juste lister les étapes, mais **jouer l'avocat du diable
— qu'est-ce qui peut foirer, quels inconnus, quels cas limites ?** C'est ce cadrage adverse qui
permet ensuite de confier l'exécution à des modèles moins chers sans risque : le cerveau fort a
déjà anticipé les pièges, les exécutants n'ont plus qu'à dérouler et rapporter.

## Anti-pièges
- Ne pas mettre Opus/Fable partout « par confort » : c'est le gaspillage n°1.
- Ne pas router vers le bas pour économiser puis « oublier » de repasser la gate forte à la fin.
- `max` n'est pas un bouton « meilleur » : c'est un bouton « plus long et plus cher », souvent au
  détriment du résultat.
- Toujours distinguer ce qu'un petit modèle a **exécuté** de ce qu'un grand modèle a **vérifié**.
