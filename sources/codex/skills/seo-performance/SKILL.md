---
name: seo-performance
description: "Piloter de bout en bout la croissance SEO d'une ou plusieurs plateformes : recherche et sélection de mots-clés, analyse réelle de Google et Search Console, implémentation des optimisations, mesure et routine hebdomadaire d'amélioration continue. À utiliser pour mettre en place, auditer, corriger ou faire progresser le référencement naturel ; ne s'applique pas à l'achat média seul."
---

# SEO performance

Construire et faire tourner une boucle de croissance organique fondée sur des preuves :

`données → mots-clés → décision → action → vérification → mesure → nouvelle action`.

Le résultat attendu n'est ni un audit isolé ni un volume de contenus. C'est un système actif qui choisit les bonnes intentions, améliore réellement les pages utiles et mesure l'effet sur la visibilité et les conversions.

## Comportement par défaut

Lorsqu'il est demandé de mettre en place ou de prendre en charge le SEO d'une plateforme, ne pas s'arrêter aux constats ou aux recommandations. Poursuivre, dans la limite des autorisations disponibles, jusqu'à avoir :

1. recherché les mots-clés et intentions à partir de données réelles ;
2. vérifié les résultats Google des groupes prioritaires ;
3. choisi les opportunités les plus pertinentes pour le produit et la conversion ;
4. réalisé un premier lot d'améliorations de bout en bout ;
5. vérifié techniquement, visuellement et éditorialement ce lot ;
6. enregistré une base de comparaison datée ;
7. créé ou mis à jour une routine hebdomadaire qui récupère les nouveaux chiffres, décide et agit à nouveau.

Un rapport qui se termine seulement par « voici ce qu'il faudrait faire » est incomplet lorsqu'une action sûre et autorisée peut être exécutée. Limiter le travail à un diagnostic uniquement si l'utilisateur le demande explicitement.

## Choisir le parcours

- Pour une première prise en charge globale, lire [references/cadre-operatoire.md](references/cadre-operatoire.md), puis [references/execution-et-mesure.md](references/execution-et-mesure.md) et [references/routine-hebdomadaire.md](references/routine-hebdomadaire.md).
- Pour un diagnostic, une stratégie ou une recherche de mots-clés explicitement limitée à l'analyse, lire [references/cadre-operatoire.md](references/cadre-operatoire.md).
- Pour modifier ou publier un site, lire [references/execution-et-mesure.md](references/execution-et-mesure.md).
- Pour installer, mettre à jour ou exécuter le suivi récurrent, lire [references/routine-hebdomadaire.md](references/routine-hebdomadaire.md).
- Pour plusieurs plateformes, commencer par le registre portefeuille décrit dans le cadre opératoire, puis traiter et automatiser chaque plateforme séparément.

## Preuves obligatoires pour les mots-clés

Ne jamais produire une liste de mots-clés par simple intuition ou génération linguistique. Croiser autant que possible :

- requêtes, impressions, clics, CTR et positions de Google Search Console ;
- résultats Google réellement ouverts, types de pages classées et fonctionnalités de la SERP ;
- suggestions Google, questions associées et recherches liées lorsqu'elles sont visibles ;
- Keyword Planner avec son territoire, sa langue, sa période et ses limites ;
- Google Trends comme indice relatif, jamais comme volume absolu ;
- pages concurrentes légitimes, couverture thématique et lacunes utiles ;
- contenu existant, vérité du produit, conversion attendue et vocabulaire réel du public.

Si Search Console ou Keyword Planner n'est pas accessible, poursuivre avec les autres preuves et déclarer précisément la limite. Pour une interface Google connectée ou personnalisée, utiliser le navigateur intégré Codex et les sessions de test ou autorisées disponibles. Pour une SERP publique, utiliser la recherche web et ouvrir les résultats utiles ; ne pas conclure à partir des seuls extraits d'une page de résultats.

Pour chaque chiffre, conserver la source, la date d'extraction, la période, le territoire, l'unité et le caractère exact, arrondi ou estimé.

## De la recherche à l'action

Regrouper les requêtes par intention réelle et attribuer une seule page canonique à chaque intention principale. Prioriser selon l'adéquation produit, la valeur de conversion, la demande prouvée, la position ou l'autorité existante, la correspondance avec la SERP, la faisabilité, le risque et l'effort.

Choisir ensuite le meilleur lot borné et l'exécuter : correction d'indexation ou de rendu, consolidation d'une page, titre ou extrait, maillage interne, contenu manquant, CTA et mesure de conversion, ou nouvelle page lorsqu'une intention distincte le justifie réellement. Ne pas créer artificiellement une page par variante ou une nouvelle page chaque semaine.

Une action n'est terminée que lorsque toute la chaîne pertinente a été traitée : contenu, métadonnées, canonical, maillage, sitemap, rendu crawlable, CTA, mesure, tests, relecture et contrôle visuel.

## Routine hebdomadaire obligatoire

Lors d'une mise en place globale, créer ou mettre à jour avant la fin du travail une tâche planifiée hebdomadaire nommée `SEO hebdomadaire — <plateforme>`. Rechercher d'abord une tâche équivalente et la mettre à jour plutôt que créer un doublon.

- Utiliser une tâche récurrente attachée à la tâche courante lorsqu'elle doit conserver son contexte ; utiliser une tâche autonome de projet seulement si chaque exécution doit repartir d'un prompt stable.
- À défaut d'horaire donné, choisir le lundi à 09 h 00 dans le fuseau local de l'utilisateur.
- Le prompt planifié doit exécuter le cycle décrit dans [references/routine-hebdomadaire.md](references/routine-hebdomadaire.md), pas seulement produire un rapport.
- Chaque passage doit récupérer les données récentes, les comparer à une période cohérente, contrôler les alertes, réexaminer les SERP utiles, choisir une priorité, appliquer le lot autorisé, le vérifier et consigner le résultat.
- Toutes les quatre exécutions environ, réévaluer plus largement la carte des intentions, les nouveaux mots-clés, la cannibalisation et les concurrents.

Si l'outil de planification n'est pas disponible, préparer le prompt complet et signaler que la routine n'a pas été créée. Ne jamais prétendre qu'une planification existe sans preuve de sa création ou de sa mise à jour.

## Principes non négociables

- Ne jamais garantir une première position. Transformer l'ambition en jalons : indexation, impressions, top 20, top 10, top 3, CTR et conversions.
- Vérifier le produit, le domaine cible, le public et la conversion avant de choisir les mots-clés. Ne pas extrapoler les fonctions d'un produit à partir de son nom.
- Dater et sourcer les affirmations importantes. Pour le droit, la paie, la fiscalité ou une règle métier, partir des sources officielles et conserver les exceptions utiles.
- Distinguer ce qui a été relu manuellement, détecté automatiquement et non vérifié. Un scan ou une extraction n'est pas une validation de fond.
- Ne pas présenter les plages de Keyword Planner comme des volumes exacts. La concurrence Google Ads et les enchères ne mesurent pas la difficulté SEO.
- Refuser les pages minces, la duplication géographique artificielle, le bourrage de mots-clés, les faux avis, les fausses statistiques et les données structurées trompeuses.
- L'autorisation de modifier ou déployer une plateforme ne s'étend jamais à une autre. Une routine peut analyser et préparer des changements, mais elle ne publie en production que lorsqu'une autorisation explicite et durable couvre cette plateforme.
- N'appeler aucune API IA facturée ou AI Gateway sans autorisation explicite et plafond de coût. Le budget externe par défaut est 0 €.
- Préserver le travail existant, les règles du dépôt, les données privées et les secrets. Ne jamais contourner les contrôles de sécurité pour accélérer un lot SEO.

## Rapport attendu

Terminer par un rapport compact contenant :

- résultat réellement livré et action prioritaire exécutée ;
- requêtes et intentions visées, avec source et période des chiffres ;
- modifications et URL concernées ;
- vérifications automatiques ;
- relecture manuelle ;
- éléments non vérifiés ;
- mesure avant/après disponible ou date prévue de réévaluation ;
- SHA, Preview et production lorsqu'ils existent ;
- état de la routine hebdomadaire : créée, mise à jour ou non créée, avec raison ;
- prochaine décision fondée sur les données.
