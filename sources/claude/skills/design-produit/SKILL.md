---
name: design-produit
description: "Design produit — simplicité contextuelle : une interface sobre, intuitive et utilisable sans formation. Le standard NORMATIF de l'expérience attendue dans toutes les applications de Rose. À charger dès qu'on conçoit, construit ou refond une fonctionnalité visible par un utilisateur, et OBLIGATOIREMENT référencé dans tout prompt-chantier qui promet une expérience utilisateur. Contient aussi le VERROU FULL-STACK : interdiction de livrer le back sans le front."
---

<!-- Les règles UX de ce document sont normatives. Les couleurs, polices et tokens propres au projet doivent être repris du code ou de la charte existante, jamais inventés par l'agent. Toute dérogation importante nécessite l'accord explicite de Rose. -->

# Design System : simplicité contextuelle

## Overview

### Creative North Star : « Le logiciel s'efface derrière la tâche »

L'interface doit donner l'impression que le travail est simple, même lorsque le système sous-jacent est complexe. L'utilisateur ne doit pas voir l'architecture du logiciel, la richesse technique du produit ni toutes les possibilités disponibles. Il doit voir ce qui lui est utile, au moment où cela lui est utile.

Le produit applique deux principes fondamentaux :

1. **Divulgation progressive** : le détail et les fonctions avancées restent accessibles, mais ne surchargent pas l'état initial de l'écran.
2. **Affichage contextuel** : une information ou une action apparaît automatiquement lorsque la situation la rend pertinente.

La simplicité ne signifie pas supprimer des fonctionnalités. Elle signifie organiser la complexité pour que l'utilisateur n'ait pas à la porter mentalement.

### La règle « Pourquoi maintenant ? »

Pour chaque information, bouton, indicateur, filtre ou message visible, être capable de répondre :

> « Pourquoi cette personne a-t-elle besoin de voir cela maintenant ? »

Sans réponse claire :

* masquer l'élément ;
* le déplacer dans un détail accessible à la demande ;
* le placer dans un écran secondaire ;
* ou ne l'afficher que lorsque le contexte le rend nécessaire.

### Nécessaire ou utile — la définition qui tranche

> **Nécessaire** = la tâche est impossible ou risquée sans cet élément. **Utile** = la
> tâche reste faisable sans. La fréquence d'usage ne décide rien : un élément rare peut
> être nécessaire (exemple : « Annuler la demande »).

Ce qui est nécessaire à la tâche courante est toujours visible. Ce qui est seulement
utile se range derrière un déclencheur clair — sans jamais être supprimé.

### Les quatre niveaux de visibilité

Chaque élément appartient obligatoirement à l'un de ces niveaux :

1. **Visible maintenant** : indispensable à la tâche courante.
2. **Accessible à la demande** : utile ponctuellement, derrière un déclencheur explicite.
3. **Affiché par le contexte** : apparaît uniquement lorsque la condition concernée se produit.
4. **Absent pour ce profil** : ne concerne pas cet utilisateur et ne doit pas être affiché.

Une information rare mais critique, urgente, légale ou liée à une action irréversible doit apparaître automatiquement lorsque la situation se produit. Elle ne doit pas occuper l'écran en permanence lorsque la condition n'existe pas.

### Une action principale par état d'écran

Chaque état d'écran doit posséder une action principale clairement identifiable.

Les actions secondaires restent disponibles, mais ne doivent pas rivaliser visuellement avec l'action principale. Les actions rares vont dans un menu secondaire, une section dépliable ou un écran de détail.

Plusieurs boutons ne doivent jamais donner l'impression d'avoir la même priorité.

### Une interface adaptée au rôle

L'interface est construite pour la personne connectée, pas seulement filtrée après coup.

Chaque profil possède :

* sa page d'arrivée ;
* son vocabulaire ;
* ses tâches fréquentes ;
* ses informations utiles ;
* ses raccourcis ;
* ses droits ;
* sa navigation.

Un utilisateur ne voit jamais les menus, boutons, réglages ou concepts internes d'un autre métier.

Masquer un menu ne suffit pas : le contenu, les intitulés, l'ordre des informations et la page d'arrivée doivent également correspondre au rôle réel de la personne.

### Organiser par tâche, jamais par architecture technique

La navigation et les écrans utilisent le langage de l'utilisateur.

Préférer :

* « Poser une absence »
* « Valider les demandes »
* « Préparer les variables du mois »
* « Compléter les informations manquantes »
* « Inviter un collaborateur »

Éviter les intitulés qui exposent la structure interne du logiciel :

* « Entités »
* « Modules »
* « Objets »
* « Workflows »
* « Configurations »
* « Domaines »

Un terme technique n'est acceptable que s'il appartient réellement au vocabulaire quotidien de l'utilisateur concerné.

### Toujours montrer la prochaine étape

Après chaque action, l'utilisateur doit comprendre :

* ce qui vient de se passer ;
* si l'action a réellement abouti ;
* qui doit agir ensuite ;
* ce qu'il peut faire maintenant ;
* où retrouver le résultat.

Un message générique comme « Enregistré avec succès » ne suffit pas lorsqu'une suite existe.

### Prévenir plutôt que faire corriger

L'interface doit empêcher les erreurs prévisibles avant validation :

* montrer les conséquences importantes ;
* désactiver une action impossible avec une explication ;
* proposer des valeurs par défaut adaptées ;
* réutiliser les informations déjà connues ;
* signaler une incohérence au moment où elle apparaît ;
* préserver le travail en cas d'interruption ;
* demander confirmation uniquement pour les conséquences importantes ou irréversibles.

### Le test sans formation

Un parcours principal n'est pas terminé tant qu'une personne découvrant le produit ne peut pas :

1. partir de sa page d'arrivée normale ;
2. trouver naturellement le point de départ ;
3. reconnaître l'action à effectuer ;
4. accomplir la tâche sans documentation ;
5. comprendre le résultat ;
6. savoir quoi faire ensuite ;
7. récupérer d'une erreur sans impasse.

Le test commence depuis la navigation réelle avec le bon profil. Une URL directe, une explication orale ou une maquette autonome ne constituent pas une preuve.

### Les cinq questions de contrôle

En arrivant sur chaque écran, l'utilisateur doit pouvoir comprendre rapidement :

1. Où suis-je ?
2. Qu'est-ce qui mérite mon attention ?
3. Quelle action puis-je effectuer maintenant ?
4. Que se passera-t-il après ?
5. Où puis-je trouver le détail si j'en ai besoin ?

Si l'écran ne permet pas de répondre naturellement, il doit être simplifié.

### Caractéristiques essentielles

* Interface calme et lisible.
* Hiérarchie visuelle immédiatement compréhensible.
* Une action principale évidente.
* Navigation adaptée au rôle.
* Détails disponibles sans être imposés.
* États vides qui enseignent.
* Messages orientés vers la suite.
* Comportements cohérents d'un écran à l'autre.
* Parcours principaux utilisables sans formation.
* Efficacité préservée pour les utilisateurs expérimentés.
* Fonctionnement complet sur ordinateur et mobile.
* Accessibilité intégrée dès la conception.

## Colors

La couleur sert à orienter, hiérarchiser et informer. Elle ne sert pas à décorer ou à remplir l'espace.

Utiliser en priorité la palette et les tokens déjà définis dans le projet. Ne jamais inventer une nouvelle nuance locale lorsqu'un token sémantique existe.

### Primary

La couleur principale est réservée à :

* l'action principale ;
* l'élément actuellement sélectionné ;
* le focus ;
* les rares éléments qui nécessitent réellement l'attention.

Elle ne doit pas colorer plusieurs actions concurrentes sur le même écran.

### Semantic colors

Utiliser des couleurs sémantiques cohérentes pour :

* succès ;
* information ;
* avertissement ;
* erreur ;
* élément désactivé ;
* état sélectionné ;
* état en attente.

Une même couleur doit toujours porter le même sens.

Ne jamais utiliser la couleur seule pour transmettre une information. Ajouter un libellé, une icône ou un changement de forme compréhensible.

### Neutral colors

Les couleurs neutres portent l'essentiel de l'interface :

* arrière-plan ;
* surfaces ;
* séparateurs ;
* texte principal ;
* texte secondaire ;
* éléments désactivés.

Le contraste doit respecter WCAG AA :

* texte courant : au moins 4,5:1 ;
* texte large et éléments graphiques essentiels : au moins 3:1.

### Named Rules

**The Restraint Rule.** La rareté de la couleur principale lui donne son efficacité. L'accent ne doit jamais devenir un remplissage décoratif généralisé.

**The Semantic Rule.** Une couleur possède un sens stable dans toute l'application.

**The No Decoration Rule.** Aucun dégradé, effet lumineux, couleur saturée ou fond coloré ne doit être ajouté uniquement pour rendre l'écran « plus vivant ».

## Typography

Utiliser une typographie sobre, familière et très lisible. Une seule famille sans-serif bien réglée est généralement préférable pour l'interface du produit.

La typographie sert à construire la hiérarchie, pas à produire un effet spectaculaire.

### Hierarchy

* **Titre de page** : identifie clairement le territoire ou la tâche.
* **Titre de section** : structure les étapes importantes.
* **Texte courant** : explique uniquement ce qui aide à agir.
* **Libellé** : nomme précisément le champ ou l'action.
* **Texte secondaire** : apporte un détail réellement utile.
* **Donnée tabulaire** : privilégie la lisibilité et l'alignement.

Limiter les niveaux typographiques. Une multiplication de tailles, graisses, capitales et couleurs crée du bruit.

Les intitulés d'action utilisent de préférence un verbe et un objet :

* « Envoyer l'invitation »
* « Enregistrer les modifications »
* « Valider la demande »
* « Voir le détail »

Éviter les libellés vagues :

* « Continuer »
* « Gérer »
* « Action »
* « Plus »
* « OK »

La longueur des textes explicatifs reste limitée. Une explication longue appartient à une aide contextuelle ou une documentation secondaire.

### Named Rules

**The Plain Language Rule.** Écrire avec les mots de l'utilisateur, jamais avec ceux de l'architecture technique.

**The Recognition Rule.** L'utilisateur doit reconnaître ce qu'il peut faire sans devoir mémoriser le fonctionnement du logiciel.

**The Quiet Hierarchy Rule.** La hiérarchie doit être évidente sans titres gigantesques, capitales omniprésentes ni contrastes exagérés.

## Elevation

L'interface est plate par défaut. La profondeur est créée principalement par :

* l'espacement ;
* les surfaces ;
* les séparateurs ;
* les variations de fond ;
* la hiérarchie typographique.

Les ombres sont réservées aux éléments réellement superposés :

* menu flottant ;
* panneau temporaire ;
* boîte de dialogue ;
* élément déplacé ;
* élément survolé lorsque cela aide à comprendre l'interaction.

Ne pas transformer chaque section en carte. Ne jamais imbriquer des cartes dans des cartes.

Les bordures et les ombres ne doivent pas être combinées par réflexe. Choisir le traitement le plus discret permettant de comprendre la structure.

Les angles restent modérément arrondis et cohérents. Les cartes, champs et panneaux ne doivent jamais ressembler à des bulles excessivement arrondies.

### Named Rules

**The Flat-by-Default Rule.** Une surface reste plate tant qu'elle n'a pas de raison fonctionnelle d'être placée au-dessus d'une autre.

**The No Card Reflex Rule.** Un groupe d'informations ne devient pas automatiquement une carte. Utiliser d'abord l'espace, les titres, les listes et les séparateurs.

**The No Nested Cards Rule.** Les cartes imbriquées sont interdites.

## Components

Tous les composants doivent partager le même vocabulaire visuel et le même comportement.

Chaque composant interactif doit prévoir :

* état normal ;
* survol ;
* focus clavier visible ;
* état actif ;
* état sélectionné ;
* état désactivé ;
* chargement ;
* succès ;
* erreur.

### Buttons

* Un seul bouton principal par état d'écran.
* Les boutons secondaires restent visuellement plus discrets.
* Les actions rares ou avancées vont dans un menu explicite.
* Une action destructive est clairement identifiée et séparée.
* Un bouton désactivé doit expliquer pourquoi l'action n'est pas disponible lorsque cette raison n'est pas évidente.
* Le libellé décrit l'action réelle.

Ne jamais placer une action fréquente et importante derrière un menu « … ».

### Navigation

* Afficher uniquement les territoires utiles au profil connecté.
* Organiser la navigation selon les tâches et les objets connus de l'utilisateur.
* Ne jamais afficher un menu qui mène systématiquement à un refus.
* Mettre le territoire principal du profil en premier.
* Conserver les réglages personnels séparés des réglages de l'entreprise ou de l'organisation.
* Sur mobile, restructurer la navigation au lieu de simplement comprimer la version ordinateur.
* L'élément actif doit être clairement identifiable sans décoration excessive.

### Progressive disclosure

Utiliser, selon le besoin :

* « Voir le détail » ;
* section dépliable ;
* panneau latéral ;
* onglet secondaire ;
* menu d'actions avancées ;
* page de détail ;
* affichage déclenché par une condition.

Le déclencheur doit être visible, compréhensible et nommé explicitement.

Ne jamais masquer une information nécessaire derrière :

* une icône sans libellé ;
* une interaction au survol uniquement ;
* un geste non annoncé ;
* une couleur ;
* un menu ambigu.

### Forms

* Ne demander que les informations nécessaires à l'étape courante.
* Réutiliser les données déjà connues.
* Regrouper les champs selon la logique de la tâche.
* Révéler les champs conditionnels uniquement lorsque le choix précédent les rend nécessaires.
* Montrer les erreurs au niveau du champ concerné.
* Conserver les valeurs saisies après une erreur.
* Afficher le résultat d'un calcul important avant validation.
* Utiliser des placeholders contextuels et visuellement secondaires.
* Ne jamais remplacer un libellé par un placeholder.

Un formulaire long doit être découpé selon les étapes naturelles du travail, pas selon les tables de la base de données.

### Lists and tables

* Montrer d'abord les colonnes nécessaires aux décisions fréquentes.
* Déplacer les détails rares dans la fiche, un panneau ou des colonnes optionnelles.
* Conserver les filtres réellement utiles.
* Éviter les filtres présents uniquement parce que la donnée existe.
* Proposer les actions groupées aux utilisateurs qui en ont réellement besoin.
* Préserver le contexte lorsqu'un détail est ouvert puis fermé.
* Sur mobile, restructurer les informations au lieu de forcer un tableau illisible.

### Empty states

Un état vide explique :

* pourquoi l'écran est vide ;
* ce qui apparaîtra ici ;
* comment commencer ;
* ou qui doit agir avant l'utilisateur.

Un état vide ne doit jamais se limiter à « Aucune donnée ».

### Loading states

Utiliser un squelette correspondant à la structure attendue lorsque le chargement dure suffisamment pour être perceptible.

Éviter les écrans entièrement bloqués par un indicateur de chargement lorsque certaines parties peuvent déjà être utilisées.

### Errors

Une erreur doit indiquer :

* ce qui n'a pas fonctionné ;
* ce qui a été conservé ;
* ce que l'utilisateur peut faire ;
* si une autre personne doit intervenir ;
* comment réessayer.

Ne jamais transformer silencieusement une erreur en écran vide.

### Feedback and next step

Après une action, afficher un retour contextualisé :

* résultat ;
* nouvel état ;
* prochaine étape ;
* personne attendue ;
* emplacement où retrouver l'information.

### Modals

Une fenêtre modale n'est jamais le premier choix.

Préférer :

* interaction dans la page ;
* panneau latéral ;
* section dépliable ;
* page dédiée.

Réserver les modales aux décisions courtes, ponctuelles et réellement bloquantes.

## Motion

Les animations servent uniquement à :

* montrer un changement d'état ;
* confirmer une interaction ;
* révéler un contenu demandé ;
* aider à comprendre un déplacement.

Aucune animation décorative, rebond ou chorégraphie de chargement.

Respecter `prefers-reduced-motion`.

## Expert use

La simplicité destinée aux nouveaux utilisateurs ne doit pas ralentir les utilisateurs expérimentés.

Lorsque le contexte le justifie, prévoir :

* recherche ;
* filtres mémorisés ;
* actions groupées ;
* raccourcis clavier ;
* valeurs par défaut adaptées ;
* reprise du travail en cours.

Ces fonctions restent accessibles sans alourdir le parcours principal.

## Completion gate

Une interface n'est pas terminée tant que :

* elle existe dans la véritable application ;
* elle est accessible depuis la navigation normale ;
* elle est testée avec le bon profil utilisateur ;
* elle est branchée aux données réelles ou à un environnement local représentatif ;
* ses états vide, chargement, erreur, succès et refus sont traités ;
* le parcours principal fonctionne sur ordinateur et mobile ;
* le focus clavier et les contrastes sont vérifiés ;
* les captures proviennent de l'application réelle ;
* une personne découvrant le produit peut accomplir la tâche sans assistance.

Une maquette HTML, une capture, Storybook, un prototype ou une route accessible uniquement par URL ne constituent jamais une fonctionnalité livrée.

## Do's and Don'ts

**Do :**

* Do commencer chaque écran par le profil concerné et sa tâche principale.
* Do demander pour chaque élément : « Pourquoi maintenant ? »
* Do afficher par défaut uniquement ce qui aide à accomplir la tâche courante.
* Do conserver les détails accessibles par un déclencheur clair.
* Do faire apparaître automatiquement une information rare lorsqu'elle devient pertinente ou critique.
* Do montrer une action principale évidente.
* Do organiser les menus selon le langage et les tâches de l'utilisateur.
* Do retirer les menus inutiles ou inaccessibles au profil connecté.
* Do montrer clairement le résultat et la prochaine étape.
* Do prévenir les erreurs avant validation.
* Do préserver les données saisies et le contexte de navigation.
* Do créer des états vides qui enseignent le fonctionnement.
* Do utiliser les mêmes composants et comportements dans toute l'application.
* Do vérifier l'interface au clavier, sur mobile et avec un texte agrandi.
* Do tester les parcours depuis la page d'arrivée réelle, sans URL directe.
* Do permettre aux utilisateurs expérimentés d'aller plus vite sans compliquer le parcours des nouveaux.
* Do rendre les sources, formules, historiques et informations détaillées accessibles sans les imposer en permanence.

**Don't :**

* Don't afficher une information uniquement parce qu'elle existe dans la base.
* Don't concevoir l'écran autour des cas rares.
* Don't montrer les outils internes d'un autre profil.
* Don't ajouter un menu pour chaque fonctionnalité.
* Don't créer un tableau de bord rempli de cartes et d'indicateurs par défaut.
* Don't placer plusieurs boutons visuellement principaux sur le même état d'écran.
* Don't cacher une action fréquente derrière un menu « … ».
* Don't utiliser une icône seule lorsque son sens n'est pas universel.
* Don't remplacer les libellés de champs par des placeholders.
* Don't afficher de longs textes d'aide avant la tâche.
* Don't utiliser des fenêtres modales par réflexe.
* Don't imbriquer des cartes.
* Don't ajouter de dégradés, glassmorphism, ombres lourdes ou animations décoratives.
* Don't utiliser des couleurs saturées sur des éléments inactifs.
* Don't inventer des composants ou interactions inhabituels lorsqu'un modèle standard suffit.
* Don't afficher « Aucune donnée » sans explication ni prochaine étape.
* Don't transformer une erreur en liste vide.
* Don't demander à l'utilisateur de ressaisir une information déjà connue.
* Don't considérer une maquette ou une capture comme une preuve d'intégration.
* Don't déclarer l'écran terminé sans l'avoir joué dans l'application réelle avec le bon profil.

## Final acceptance test

Avant de déclarer un écran terminé, répondre honnêtement :

1. L'utilisateur comprend-il où il se trouve ?
2. Voit-il ce qui nécessite son attention ?
3. L'action principale est-elle évidente ?
4. Tout ce qui est visible est-il utile maintenant ?
5. Tout ce qui est masqué reste-t-il facilement accessible ?
6. Les cas rares apparaissent-ils uniquement lorsqu'ils deviennent pertinents ?
7. Le vocabulaire appartient-il réellement à l'utilisateur ?
8. Le résultat et la prochaine étape sont-ils clairs ?
9. Le parcours fonctionne-t-il sans formation ?
10. L'écran a-t-il été vérifié dans la véritable application sur ordinateur et mobile ?

**Une seule réponse négative empêche de considérer l'interface comme terminée.**

---

## VERROU FULL-STACK — INTERDICTION DE LIVRER LE BACK SANS LE FRONT

Avant de définir le périmètre ou de créer un worktree, cartographier toute la
chaîne de livraison concernée :

- backend/API ;
- véritable frontend web ;
- application mobile ;
- back-office ;
- contrats ou types partagés ;
- déploiements correspondants.

Produire obligatoirement cette matrice :

| Livrable utilisateur | Dépôt exact | Route ou écran | Profil concerné | Preuve attendue |
|---|---|---|---|---|

Si la mission promet un comportement visible mais qu'aucune ligne de la matrice
ne désigne le véritable dépôt frontend, le prompt est contradictoire et ne doit
pas être lancé.

Créer une branche ou un worktree dans CHAQUE dépôt nécessaire. Le fait que le
premier worktree soit celui de l'API ne réduit jamais le périmètre au backend.

Un agent ne peut pas déclarer le frontend « hors périmètre », « à brancher plus
tard » ou « non vérifié » lorsque la mission décrit une expérience utilisateur.

### Définition de « terminé » pour une fonctionnalité visible

La fonctionnalité n'est terminée que si :

- le backend nécessaire fonctionne ;
- le code existe dans le véritable frontend de production ;
- la route réelle est créée ;
- l'écran est accessible depuis la navigation normale du bon profil ;
- le frontend est branché à l'API ;
- les états vide, chargement, erreur et succès sont traités ;
- le parcours complet est joué dans un vrai navigateur ;
- le parcours est vérifié sur ordinateur et mobile ;
- les captures proviennent de l'application réelle ;
- le résultat respecte `DESIGN.md`.

Une maquette HTML, Storybook, une capture, un prototype ou une route accessible
uniquement par URL ne constituent jamais un frontend livré.

S'il manque le frontend, le verdict reste `IN_PROGRESS`, même si le backend,
les migrations et les tests API sont entièrement verts.

---

## Articulation avec les autres skills

- **`ecran`** porte les corrections datées de Rose (STANDARD-ROSE-UX.md) et le juge
  automatique `ergo-check`. Les deux se cumulent : `design-produit` dit l'expérience
  cible, `ecran` dit comment Rose a déjà tranché et comment mesurer. En cas de
  contradiction, la citation datée de Rose (via `ecran`) prime.
- **Couleurs, polices, tokens** : toujours repris du projet courant (charte, DESIGN.md,
  code existant) — jamais inventés. « Chaque projet a son identité. »
- **`chantier`** : tout prompt-chantier qui promet une expérience utilisateur DOIT
  renvoyer à ce skill et recopier le VERROU FULL-STACK ci-dessus.
