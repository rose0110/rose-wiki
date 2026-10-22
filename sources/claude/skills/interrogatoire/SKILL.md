---
name: interrogatoire
description: Interroger Rose, avec méthode, pour l'aider à savoir ce qu'elle veut AVANT de construire — un outil, un écran, un chantier, une décision. Les questions passent toujours par le formulaire de questions, par tours, avec une réponse recommandée. Inspiré du skill « grill me » de Matt Pocock (mattpocock/skills, licence MIT), adapté aux règles de Rose. À charger quand Rose dit « interroge-moi », « grill me », « aide-moi à savoir ce que je veux », « réfléchissons ensemble », quand elle demande quelque chose de nouveau dont la forme n'est pas arrêtée (nouvel outil, refonte, nouveau projet), ou avant tout chantier où un élément n'a pas de source (RÈGLE 15). Vaut pour tous les projets.
---

# Interrogatoire — aider Rose à savoir ce qu'elle veut

Le but : sortir de la tête de Rose ce qu'elle n'a pas encore dit, avant d'écrire une ligne.
Ce qu'elle ignore qu'elle ignore (sécurité, mise en ligne, usage au téléphone, ce qui la gêne
dans l'outil actuel) se découvre ici, pas après une livraison refusée.

## Étape 1 — Chercher d'abord, seul
Avant la première question, lire tout ce qui existe déjà : mémoire, `PROJECT-HANDOFF.md`,
`CHANTIERS.md`, anciennes versions, captures, transcriptions client. Une question dont la
réponse est dans un fichier est interdite.
**Terminé quand** : je peux dire en une phrase ce que je sais déjà et d'où je le sais.

## Étape 2 — Dresser l'arbre des décisions
Chaque décision en entraîne d'autres. La **frontière** = les décisions dont tout ce dont elles
dépendent est déjà tranché : celles qu'on peut poser maintenant sans deviner.
Les **faits** (ce que contient le code, ce que coûte un service, ce que font Asana ou Notion)
sont mon travail : je les cherche (sous-agent si besoin), je ne les demande jamais.
Les **décisions** (ce qu'elle veut, ce qu'elle aime, ce qui compte pour elle) sont à Rose.
**Terminé quand** : la frontière est listée, faits séparés des décisions.

## Étape 3 — Poser un tour par le formulaire
- Toujours l'outil de questions (AskUserQuestion), jamais une question dans le texte (RÈGLE 30).
- Au plus 4 questions par tour, les plus structurantes d'abord ; le reste attend le tour suivant.
- Chaque question : courte, mots de tous les jours, 2 à 4 options concrètes, **ma recommandation
  en premier avec « (Recommandé) »**. Quand une option se voit mieux qu'elle ne se dit, mettre
  un aperçu (preview) : une mini-maquette vaut mieux qu'une description.
- Pour un écran ou un outil visuel : montrer comment 2 ou 3 produits connus le font (RÈGLE 24)
  et faire choisir sur ces exemples, pas dans l'abstrait.
- Au-dessus du formulaire, 2 à 3 lignes au plus : où on en est, ce que j'ai trouvé seul.
**Terminé quand** : le formulaire est envoyé et j'attends les réponses.

## Étape 4 — Recalculer et recommencer
Chaque réponse tranche une branche et ouvre les suivantes. Une réponse libre de Rose (« Autre »)
est une donnée : la reformuler en décision et la vérifier au tour suivant si elle est ambiguë.
Ne jamais retirer ni ajouter quelque chose sur un mot ambigu : demander lequel.
Rose peut dire « assez » à tout moment : on s'arrête et on travaille avec ce qui est tranché,
en disant ce qui reste supposé.
**Terminé quand** : la frontière est vide, rien n'est supposé en silence.

## Étape 5 — Faire valider le résumé, puis consigner
- Écrire un résumé court : ce qui est décidé, ce qui est écarté, ce qui reste ouvert. Chaque
  point dit sa source (« votre réponse du tour 2 », « le devis »).
- Demander par le formulaire : « C'est bien ce que vous voulez ? » (Oui / À corriger).
- Après son oui seulement : consigner dans `PROJECT-HANDOFF.md` (décisions, avec la date) et
  ouvrir le chantier dans `CHANTIERS.md`. Les mots de Rose deviennent le vocabulaire du projet :
  les mêmes mots à l'écran, dans le code et dans nos échanges.
**Terminé quand** : Rose a dit oui au résumé et la passation est à jour.

## Ce que ce skill ne fait pas
- Il ne construit rien. La construction commence après l'étape 5, en mode chantier.
- Il ne pose pas de question technique à Rose (hébergement, base, librairie) : je tranche,
  je le dis en une ligne.
  ➡️ Rappel du 19/10/2026 (assistant de réunions) : j'avais demandé « où veux-tu retrouver
  tes réunions ? » (SmartDataPay, application à part, OneDrive) — c'est une question de
  rangement, donc technique ; Rose n'avait pas la réponse (« je n'irai jamais les voir, c'est
  l'IA qui ira chercher »). Test avant chaque question : « Rose peut-elle répondre sans
  connaître la technique ? » Sinon, je demande plutôt COMMENT elle s'en servira, et je
  déduis le reste.
- Il ne demande jamais un go de mise en ligne : ça reste un formulaire séparé, au bon moment.
