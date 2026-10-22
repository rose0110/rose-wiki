# Quatre amendements proposés au design system

Rédigés le 25/08/2026, après une journée d'application réelle du document sur
les écrans HUP (saisie client, activité journalière, collecte du mois).
**À intégrer par Rose dans `SKILL.md` — ce fichier n'est qu'un brouillon.**

Chacun corrige un défaut constaté à l'usage, pas une objection de principe.

---

## 1. « Nécessaire » n'est pas « utile »

**À insérer dans « Les quatre niveaux de visibilité », juste après la liste.**

> **Nécessaire ou utile : la distinction qui commande tout le reste.**
>
> **Nécessaire** = sans cet élément, la tâche ne peut pas être accomplie, ou
> elle est accomplie faux. Niveau 1, visible.
>
> **Utile** = il aide, il rassure, on le consulte de temps en temps, mais on
> travaille sans. Niveau 2, accessible à la demande — et une infobulle est
> alors un moyen légitime.
>
> **Le test :** retirer l'élément. La personne peut-elle encore finir son
> travail correctement ? Oui → utile. Non → nécessaire.
>
> ⚠️ Cette distinction s'applique AVANT toute règle d'interdiction. Sans elle,
> deux règles de ce document se contredisent : « n'afficher que ce qui aide à
> la tâche courante » et « ne jamais masquer derrière un survol ». Appliquer
> la seconde à tout ce qu'on trouve reconstruit l'écran chargé que ce document
> combat.

**Pourquoi.** C'est la charnière du document, et elle n'y figurait pas. Le
25/08/2026, faute de l'avoir, j'ai classé « manquement » l'infobulle qui porte
un code de rubrique OpenPaye — information dont la gestionnaire n'a pas besoin
pour remplir sa grille. Rose a dû la donner à l'oral : « une information
nécessaire et une information utile, c'est deux choses différentes ».

---

## 2. Le format se choisit selon qui ouvre l'écran

**Remplace la ligne « Fonctionnement complet sur ordinateur et mobile » des
caractéristiques essentielles, et la ligne correspondante du portail de fin.**

> **Le format se choisit selon le public de l'écran.**
>
> Un écran de MÉTIER — celui qu'un professionnel garde ouvert toute la journée
> devant une grille dense — se conçoit et se vérifie sur ordinateur. Le
> rétrécir pour 390 pixels dégrade l'outil réel au profit d'un usage qui
> n'existe pas.
>
> Tout ce qui part vers un CLIENT, un salarié ou un tiers — un lien reçu par
> mail, un formulaire, une page publique — s'ouvre d'abord sur un téléphone.
> Là, le mobile est le cas principal.
>
> Reste vrai des deux côtés : pas de défilement horizontal de la page, et un
> contenu qui ne casse pas dans une fenêtre étroite.

**Pourquoi.** La formulation absolue a été contredite par Rose elle-même le
jour de sa mise en place : « le gestionnaire de paie ne travaille pas sur
mobile ». Une règle normative que son auteur enfreint le jour même s'applique
ensuite « au cas par cas », c'est-à-dire plus du tout — et elle emporte les
autres règles avec elle.

---

## 3. Un ordre d'arbitrage, et une page qui bloque

**À insérer en tête du document, avant « Overview ».**

> **Quand deux règles s'opposent, cet ordre tranche :**
>
> 1. **La justesse.** Un chiffre faux ou une donnée perdue l'emporte sur toute
>    considération de forme.
> 2. **La citation datée de Rose** (`STANDARD-ROSE-UX.md`).
> 3. **Le nécessaire avant l'épuré.** Ce sans quoi la tâche échoue se montre,
>    même si l'écran y perd en calme.
> 4. **L'épuré avant le complet.** À utilité égale, ce qui se replie se replie.
> 5. **La cohérence avant la perfection locale.** Un écran qui ressemble à ses
>    voisins vaut mieux qu'un écran mieux dessiné mais seul de son espèce.
>
> **Ce qui BLOQUE une livraison** — le reste du document est une référence, ces
> huit points sont un barrage :
>
> - le front n'existe pas dans le vrai dépôt, ou n'est pas atteignable depuis
>   la navigation normale du bon profil ;
> - un état parmi vide / chargement / erreur / succès / refus n'est pas traité ;
> - une action nécessaire n'est atteignable qu'au survol, par une icône seule,
>   ou par une URL ;
> - un message d'erreur ne dit pas ce qui a été conservé ni quoi faire ;
> - une valeur calculée est affichée sans pouvoir dire d'où elle vient (voir 4) ;
> - le parcours n'a pas été joué dans l'application réelle avec le bon profil ;
> - les captures ne viennent pas de l'application réelle ;
> - le vocabulaire est celui du modèle de données, pas celui de l'utilisateur.

**Pourquoi.** Cent cinquante prescriptions au même ton impératif, sans
hiérarchie : c'est le lecteur qui tranche, et il tranche mal. Et un document de
cinq cents lignes qu'il faut lire avant d'agir souffre de ce qu'il dénonce —
un écran ne s'ouvre pas sur son mode d'emploi, un standard non plus.

---

## 4. Une valeur calculée dit d'où elle vient, ou refuse de s'afficher

**Nouvelle section, à placer après « Prévenir plutôt que faire corriger ».**

> ### La traçabilité des valeurs calculées
>
> Dès qu'un écran affiche un montant, un taux, une durée, une échéance ou un
> décompte que le logiciel a calculé :
>
> - **la règle appliquée est consultable** — quelle convention, quel barème,
>   quelle version, de quand. Sur l'écran, pas dans un autre module ;
> - **rien n'est deviné.** Quand le paramètre manque, le logiciel REFUSE de
>   calculer et le dit. Il ne retombe pas sur une valeur par défaut, un régime
>   général ou une moyenne ;
> - **le refus est explicite et actionnable** : ce qui manque, où le
>   renseigner, ce qui a été conservé ;
> - **l'erreur ne se mange pas.** Un calcul qui échoue n'a pas le droit de
>   laisser un écran vide ou un total à zéro.
>
> Une valeur par défaut silencieuse est le pire défaut possible : elle a
> l'apparence exacte du bon fonctionnement.

**Pourquoi.** C'est la règle qui manquait le plus à un document écrit pour des
produits de paie. Le 25/08/2026, deux défauts trouvés dans HUP relevaient
d'elle, et d'aucune autre : un moteur qui écrivait `taux ?? 10` et calculait
donc la propreté à 10 % au lieu de 11 % sur chaque heure complémentaire, sans
une ligne dans les journaux ; et un formulaire client qui, faute d'un champ
jamais produit par le serveur, effaçait la déclaration précédente quand le
client revenait la corriger. Aucun des deux ne se voyait à l'écran. Aucune
des dix questions d'acceptation ne les aurait attrapés.
