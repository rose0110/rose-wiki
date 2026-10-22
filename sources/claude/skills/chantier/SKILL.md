---
name: chantier
description: Génère un "prompt-chantier autonome" — un fichier objectif (cible, juge, faits durs, garde-fous, définition de "terminé") à lancer dans une AUTRE session façon /goal, sur le modèle « One Prompt, A Whole Task ». Marche dans TOUS les projets : le skill lit le CLAUDE.md du projet courant pour en tirer les garde-fous, le juge et les points d'arrêt. À invoquer dès que Rose veut « un prompt pour lancer un chantier », « un prompt goal », « un prompt à lancer dans une autre session », « refais ce genre de prompt pour tel sujet ».
---

# Prompt-chantier autonome — générateur (tous projets)

## À quoi ça sert
Produire un **fichier objectif** que Rose colle dans une autre session Claude Code (ou `/goal`)
pour lancer un chantier autonome : le modèle fonce d'un bloc, vérifie son propre travail, et
ne s'arrête que sur les vrais points d'arrêt. On sort un **fichier** (pas un message) car
`/goal` plafonne à ~4 000 caractères.

Le fichier est TOUJOURS accompagné de sa ligne de lancement :
> « Lis le fichier `PROMPT-CHANTIER-<SUJET>.md` et exécute tout ce qui est sous la ligne de
> séparation comme ton objectif. Suis-le exactement, y compris la règle "ne me demande rien".
> Ne me fais aucun rapport avant que la définition de "terminé" soit atteinte. Commence maintenant. »

## Principe directeur
**Décrire la cible, les garde-fous et les critères de sortie — pas la méthode.** Le modèle
choisit son plan, son découpage et son orchestration mieux qu'un mode d'emploi écrit
d'avance. Ce qui doit être écrit, c'est ce qu'il ne peut PAS deviner : les faits du projet,
et **comment il saura tout seul que c'est juste**.

Test à appliquer ligne par ligne en rédigeant : *est-ce que j'écris ça parce qu'un modèle
s'est déjà planté là-dessus, ou parce que c'est un fait qu'il ne peut pas connaître ?*
Corriger un comportement → supprimer. Apporter un fait → garder.

## Étape 0 — S'ADAPTER AU PROJET COURANT (obligatoire avant d'écrire)
- **Lire le(s) `CLAUDE.md`** (projet + user global) et la mémoire, pour en extraire : le juge
  du projet, les sources de vérité à ne pas hardcoder, les agents disponibles, les points
  d'arrêt (deploy/prod/main), les pièges connus.
- **Repérer l'outil de contrôle métier** (banc de test, validateur, CI) que le chantier devra
  faire passer au vert — et vérifier qu'il est RAPIDE (cf. « Le juge »).
- En l'absence de règles projet, appliquer des garde-fous génériques raisonnables et le dire.

## Le squelette (8 sections)

1. **EN-TÊTE** — titre, puis `Écrit le <date>, pour <modèle>`, puis la ligne de lancement,
   puis une ligne `---`. Tout ce qui suit = l'objectif.
2. **LA CIBLE** — formulée par l'**usage réel**, pas par une liste de tâches : ce qu'un
   utilisateur réel doit pouvoir faire de bout en bout à la fin. Viser un cran au-dessus de
   ce qui semble atteignable. Inclure : « Je ne répondrai à aucune question en cours de
   route. Tranche toi-même, écris pourquoi. »
3. **LE JUGE** — voir la section dédiée ci-dessous. C'est le cœur du prompt.
4. **LES FAITS DURS** — la seule section qui a le droit d'être longue : la base existante et
   ce qu'elle contient déjà, le périmètre, les frontières d'architecture, les décisions
   irrévocables, les interdits sourcés, les sous-cas à ne pas oublier. Si le domaine a un
   historique de bugs : « c'est un terrain à défauts, ne suppose rien de bon. »
5. **GARDE-FOUS ET POINTS D'ARRÊT** — ceux du projet (Étape 0) + les génériques ci-dessous +
   ce qui n'est jamais fait en autonomie (cf. modèle d'autonomie).
6. **LES RESSOURCES** — l'armoire à outils, sans dicter l'ordre : les agents spécialisés
   disponibles et ce qu'ils savent faire, le droit d'ouvrir des worktrees, le droit de lancer
   des agents adverses pour réfuter ses propres conclusions, renvoi au skill `routage` pour
   le coût. **Si le chantier touche une interface : renvoi aux skills `design-produit`
   (l'expérience cible normative — simplicité contextuelle, divulgation progressive,
   « pourquoi maintenant ? ») ET `ecran`** (les corrections datées de Rose + le juge
   `ergo-check`) — ne pas recopier leur contenu, sauf le VERROU FULL-STACK (voir plus bas).
7. **CE QUE JE VEUX TROUVER À LA FIN** — les livrables vérifiables, sans imposer d'ordre ni
   de phases : la matrice ✅/⚠️/❌ s'il y a un existant à cartographier, chaque règle métier
   avec sa source datée, la non-régression verte, la preuve de bout en bout, l'état prod, et
   un récap HTML qu'un inconnu peut ouvrir et rejouer seul. **Si le chantier touche une
   interface : la carte des surfaces cochée une par une** (cf. `ecran`), **la matrice de
   livraison du verrou full-stack remplie, les captures issues de l'application réelle
   (ordinateur ET mobile), et le test d'acceptation final de `design-produit` (les 10
   questions) rejoué honnêtement**.
8. **CLÔTURE** — le bloc « pas un prototype », toujours en dernier (voir ci-dessous).

## Le juge (la section qui change tout)
Exiger une preuve sans donner l'instrument pour la produire ne marche pas. Écrire :

> **Le juge, c'est `<commande exacte>`.** Tant qu'elle n'est pas verte, tu n'as pas fini.
> **La référence, c'est `<dossier / bulletin / fichier réel dont on connaît la bonne réponse>`.**
> Dans le récap, je veux la **sortie brute** de la commande, pas ton résumé.

Trois exigences :
- **Rapide et relançable à volonté.** Un contrôle de 20 minutes sera lancé une fois, à la
  fin, et l'agent bricolera autour. Un contrôle de 30 secondes sera lancé quarante fois et
  l'agent se corrigera seul. S'il n'existe qu'un gros contrôle lent, exiger un mode rapide
  (sous-ensemble, un seul dossier de référence).
- **S'il n'existe aucun juge sur le sujet, le construire est la PREMIÈRE tâche du chantier**,
  avant tout code. Un chantier sans juge automatique n'est pas livrable.
- **À la hauteur de l'enjeu** : la gate finale de justesse reste sur un modèle fort (cf.
  `routage`), jamais routée vers le bas sur un sujet à conséquence (argent, droit, sécu, prod).

## Le bloc de clôture
Toujours en dernier, après les garde-fous et le juge. Formulation générique :

> Je ne veux ni prototype, ni preuve de concept, ni « première version qu'on affinera ». Je
> veux quelque chose que tu as lancé, cassé, corrigé et relancé jusqu'à ce que ça tienne — et
> que je puisse mettre devant quelqu'un demain matin sans le prévenir de quoi que ce soit.

L'adapter à l'enjeu RÉEL du projet, jamais à une urgence inventée :
- **Paie** : au bout de la chaîne il y a un bulletin qu'un salarié va lire et un gestionnaire
  qui devra le défendre. Rejoué contre les dossiers de référence jusqu'au centime, sortie
  brute à l'appui ; un cas qui ne tombe pas juste se dit, il ne s'arrondit pas.
- **App cliente** : un client qui paie va l'ouvrir sans Rose à côté pour rattraper. Parcours
  joué de bout en bout dans le navigateur, au moins trois fois, sans rattrapage manuel.
- **Contenu public** : ça sort sous son nom.

## Garde-fous génériques (à combiner avec ceux du projet)
- **N'invente rien** — chaque fait/valeur critique vérifié à la source ; « j'ai écrit le
  code » ≠ « j'ai prouvé que ça tourne ».
- **Aucune valeur critique en dur non sourcée** (taux, barème, code, seuil) — source datée.
- **Anti-régression** — cartographier l'impact avant/après pour tout ce qui touche
  accès/multi-tenant/cœur métier ; suite verte + test qui rejouerait le bug corrigé.
- **Worktree isolé + git/CI**, jamais de déploiement manuel surgical ; auto-review du diff complet.
- **Sécurité & confidentialité by design** — 0 fuite cross-tenant.

## VERROU FULL-STACK (obligatoire dès que le chantier promet une expérience utilisateur)

Dès que la cible décrit un comportement **visible par un utilisateur** (écran, parcours,
formulaire, app), le prompt généré DOIT recopier le bloc « VERROU FULL-STACK —
INTERDICTION DE LIVRER LE BACK SANS LE FRONT » du skill `design-produit`
(`~/.claude/skills/design-produit/SKILL.md`) — c'est le SEUL contenu de skill qui se
recopie au lieu de se référencer, parce que l'agent d'exécution doit l'avoir sous les
yeux avant de créer son premier worktree. En résumé, ce que le verrou impose :

- **Avant le périmètre ou le premier worktree** : cartographier toute la chaîne de
  livraison (backend/API, véritable frontend web, mobile, back-office, contrats/types
  partagés, déploiements) et remplir la matrice
  `| Livrable utilisateur | Dépôt exact | Route ou écran | Profil concerné | Preuve attendue |`.
- **Si aucune ligne ne désigne le véritable dépôt frontend** alors que la mission promet
  un comportement visible : le prompt est contradictoire — NE PAS le lancer, corriger le
  prompt d'abord. Ce contrôle incombe AUSSI au générateur : remplir la matrice au moment
  de rédiger le prompt, dans les FAITS DURS.
- **Un worktree/branche dans CHAQUE dépôt nécessaire** ; le premier worktree sur l'API ne
  réduit jamais le périmètre au backend.
- **Interdit de déclarer le frontend « hors périmètre », « à brancher plus tard » ou
  « non vérifié »** quand la mission décrit une expérience utilisateur.
- **« Terminé » pour une fonctionnalité visible** = backend fonctionnel + code dans le
  véritable frontend de prod + route réelle + accessible depuis la navigation normale du
  bon profil + branché à l'API + états vide/chargement/erreur/succès traités + parcours
  joué dans un vrai navigateur, ordinateur ET mobile + captures de l'application réelle +
  conforme au standard de design du projet. Une maquette, Storybook, une capture, un
  prototype ou une route accessible uniquement par URL ne sont JAMAIS un frontend livré.
- **S'il manque le frontend, le verdict reste `IN_PROGRESS`**, même si backend,
  migrations et tests API sont entièrement verts.

L'expérience attendue côté utilisateur (sobre, intuitive, utilisable sans formation,
divulgation progressive, « pourquoi maintenant ? ») est celle du skill `design-produit` :
le prompt y renvoie explicitement et exige son test d'acceptation final (10 questions).

## Modèle d'autonomie (le réglage clé — le DEMANDER à Rose)
Défaut validé par Rose (13/07/2026) : **l'agent va jusqu'au bout et PROUVE**, il ne prépare
pas un dry-run laissé en attente.
- **Écriture base de PROD** : dry-run vert → applique → vérifie. **Autonome.**
- **Merge / push `main`** : autonome une fois la non-régression verte.
- **Déploiement prod** : préparé + prouvé **sur une preview** ; le déploiement final
  (`vercel --prod` ou équivalent) = **geste de Rose**.
- **Tout envoi externe réel** (dépôt DSN, email client, publication, action irréversible
  outward-facing) = **JAMAIS en autonomie**.
Sécurité = **PREUVES**, pas un feu vert manuel — sauf les 2 gestes laissés à Rose.

## Procédure
1. **Étape 0** : lire le CLAUDE.md / la mémoire, en tirer juge, garde-fous, agents, points d'arrêt.
2. **Option reconnaissance libre** — sur un sujet neuf, proposer d'abord une passe SANS
   consigne (« regarde ce dépôt et ce sujet, dis-moi comment tu t'y prendrais et ce que tu
   produirais »), puis rédiger le vrai prompt en gardant ce qui était bon. Évite d'inventer
   une structure de toutes pièces.
3. **Cadrer en 1-2 questions** (AskUserQuestion) — ne pas deviner ces deux-là :
   - **Périmètre** : sujet complet vs chemin critique d'abord vs audit+carte seulement.
   - **Autonomie prod** : autonomie totale jusqu'au déploiement final, ou « tout sauf le
     déploiement final » (défaut recommandé), + repérer tout **envoi externe réel** à laisser
     à Rose. Le reste (implémentation, découpage) : le trancher soi-même.
4. **Écrire** `PROMPT-CHANTIER-<SUJET>.md` à la racine du projet, avec les 8 sections.
   Viser ~150 lignes : ce qui est long, c'est les FAITS DURS, pas le mode d'emploi.
5. **Livrer** : donner la ligne de lancement, résumer les réglages, et **flaguer une fois,
   honnêtement**, tout garde-fou du CLAUDE.md que ce prompt lève, avec le filet qui reste.

## Les prompts sont périssables
Un prompt-chantier est écrit pour un modèle donné, à une date donnée. D'où l'en-tête
`Écrit le <date>, pour <modèle>`. **Ne jamais recycler un ancien chantier comme gabarit sans
le relire avec cette question : lequel de ces paragraphes corrigeait un défaut du modèle de
l'époque ?** À chaque sortie de modèle, repasser les chantiers types. Et quand un projet
semble « moins bien marcher », suspecter les instructions accumulées avant de suspecter le
modèle.

## Exemple : projet DataPaie (paie)
Garde-fous à injecter : méthode **verif-4-gates** (`.claude/skills/verif-4-gates/SKILL.md`) ;
aucun taux/barème en dur → `constantes_legales` datées ; sourcing officiel (BOSS, Légifrance,
URSSAF, KALI, ELENET, cahier technique DSN) ; agents `juriste-paie`, `testeur-qa` (centime),
`developpeur`, `securite-rgpd`, `chef-de-projet` ; ligne rouge = le recalcul au centime et le
sourcing juridique ne descendent jamais sous Opus.

## Anti-pièges
- Jamais « c'est un test de jusqu'où tu peux aller » comme framing : du vrai travail qui atterrit.
- Ne pas transformer un point d'arrêt en « prépare et attends » si Rose a dit que l'agent a le
  droit de le faire : dans ce cas c'est **exécute PUIS prouve**.
- Distinguer nettement, partout, ce qui est prouvé de ce qui reste.
- Un prompt-chantier est un « run 1 » : proposer ensuite un « run 2 » qui repart du récap HTML.
