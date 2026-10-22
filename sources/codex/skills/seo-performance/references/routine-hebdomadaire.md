# Routine hebdomadaire SEO

Lire ce document pour créer, mettre à jour ou exécuter la boucle récurrente d'une plateforme.

## 1. Installation de la routine

Avant de créer une tâche planifiée, rechercher les automatisations existantes par leur nom et leur prompt. Mettre à jour une routine équivalente plutôt que créer un doublon.

Configuration par défaut lorsqu'aucune préférence n'est fournie :

- nom : `SEO hebdomadaire — <plateforme>` ;
- fréquence : chaque semaine ;
- horaire : lundi à 09 h 00 ;
- fuseau : fuseau local de l'utilisateur ;
- type : tâche récurrente attachée à la tâche SEO courante pour conserver l'historique ;
- notifications : réglage normal de la tâche, sauf préférence explicite contraire.

Utiliser le mécanisme de tâches planifiées de Codex disponible dans l'application. Ne pas écrire une directive de planification brute dans la conversation. Après création ou mise à jour, contrôler l'état actif, le nom, la fréquence, le contexte ciblé et le prompt enregistré.

Si une exécution doit travailler dans un dépôt local sans dépendre du contexte du fil, utiliser une tâche autonome rattachée au bon projet et à son environnement. Ne jamais choisir un autre projet par approximation.

## 2. Prompt durable de la tâche

Le prompt planifié doit demander explicitement d'utiliser `$seo-performance`, afin que chaque exécution recharge la méthode complète. Il doit contenir, en prose claire, les instructions suivantes adaptées à la plateforme :

1. relire le dernier rapport, les lots en observation, la carte d'intentions et les autorisations de la plateforme ;
2. récupérer les nouvelles données de Search Console, analytics et conversions disponibles, sans afficher de secret ni de donnée personnelle ;
3. comparer des périodes cohérentes et signaler les limites, la saisonnalité ou un changement de tracking ;
4. contrôler l'indexation, les erreurs techniques, les pages en baisse ou en hausse, les requêtes émergentes, le CTR et les positions ;
5. réexaminer dans Google les SERP nécessaires à la décision et ouvrir les résultats pertinents ;
6. choisir une seule priorité principale selon impact probable, preuve, conversion, faisabilité, risque et fenêtre d'observation ;
7. réaliser le lot autorisé de bout en bout au lieu de remettre seulement une recommandation ;
8. exécuter les tests, relire le contenu et le diff, puis vérifier visuellement le parcours ;
9. publier uniquement si une autorisation explicite et durable couvre la plateforme et si la procédure de déploiement sûre est respectée ; sinon préparer l'état vérifiable le plus avancé ;
10. consigner les données de départ, l'hypothèse, l'action, le résultat vérifié, les éléments non vérifiés et la date de réévaluation ;
11. identifier la prochaine priorité sans modifier prématurément un lot encore en observation.

Le prompt doit nommer le domaine, le projet ou dépôt exact, les sources de mesure disponibles, la conversion principale et les limites d'autorisation connues. Il doit interdire les API IA facturées sans accord explicite et conserver un plafond externe de 0 € par défaut.

## 3. Cycle de chaque exécution

### Collecter

- Search Console : clics, impressions, CTR et position par requête et page ; couverture et indexation si disponibles.
- Analytics : sessions organiques, événements de CTA et conversions disponibles.
- Technique : statuts, robots, canonical, sitemap, rendu, liens, métadonnées et erreurs runtime pertinentes.
- Google : SERP des groupes concernés, questions, formats et changements de concurrents.
- Produit et métier : évolution de l'offre, de la documentation ou des sources officielles.

### Comparer

Comparer les 28 derniers jours aux 28 précédents lorsque le volume le permet. Utiliser les 7 derniers jours comme alerte, pas comme verdict. Comparer aussi avec la base du lot lorsque sa fenêtre d'évaluation est atteinte.

Repérer notamment :

- pages ou requêtes avec impressions fortes et CTR anormalement faible ;
- positions 4 à 20 offrant un potentiel de consolidation ;
- pertes d'impressions, de clics ou d'indexation ;
- nouvelles requêtes alignées avec le produit ;
- cannibalisation ou changement d'intention dans la SERP ;
- trafic sans passage vers le CTA ou la conversion ;
- contenus réglementés devenus incomplets ou obsolètes.

### Décider et agir

Écarter les faux signaux et les lots encore trop récents. Choisir la meilleure action mesurable et l'implémenter. Une exécution peut décider de ne pas toucher une page en observation, mais elle doit alors agir sur une autre priorité sûre ou expliquer le blocage réel.

Ne pas produire automatiquement un nouvel article chaque semaine. L'action peut être technique, éditoriale, architecturale, liée au maillage, au CTR, à la conversion ou à la mesure.

### Vérifier et consigner

Effectuer les contrôles automatiques applicables, puis lire réellement le contenu et inspecter le rendu. Enregistrer :

- date et périodes comparées ;
- sources et limites ;
- anomalie ou opportunité ;
- hypothèse ;
- action et URL ;
- état Git, tests, Preview et production selon le cas ;
- mesure de départ et date de réévaluation ;
- résultat des anciens lots arrivés à maturité ;
- prochaine priorité.

Conserver cet historique dans l'emplacement déjà prévu par le projet. À défaut, le garder dans le fil récurrent et dans un artefact privé au projet ; ne jamais versionner publiquement des données Search Console, analytics, CRM ou commerciales sans autorisation.

## 4. Recalibrage périodique

Toutes les quatre exécutions environ, élargir le contrôle :

- actualiser l'ensemble des requêtes candidates ;
- rechercher les nouveaux thèmes et formulations dans Search Console et Google ;
- réexaminer les concurrents et types de pages dominants ;
- contrôler toute la carte d'intentions et la cannibalisation ;
- vérifier que les priorités restent alignées avec le produit et les conversions ;
- archiver ou écarter les pistes sans preuve ;
- ajuster les seuils, sources et cadence si le volume réel l'exige.

Ce recalibrage ne remplace pas l'action hebdomadaire : il améliore la qualité des décisions suivantes.

## 5. Situations nécessitant une action humaine

Ne solliciter l'utilisateur que lorsqu'une étape ne peut pas être franchie avec les accès et autorisations déjà disponibles : connexion personnelle non délégable, choix métier qui change la promesse du produit, validation juridique compétente, achat d'un outil, publication non autorisée ou mutation sensible.

Demander une seule action à la fois. Continuer auparavant tout le travail sûr qui ne dépend pas de cette action.

## 6. Compte rendu hebdomadaire

Rendre un résumé court et décisionnel :

- évolution principale des chiffres et période comparée ;
- opportunité ou risque retenu ;
- action réellement réalisée ;
- vérifications effectuées ;
- ce qui reste non vérifié ;
- état de publication ;
- date de mesure du résultat ;
- prochaine priorité.

Ne jamais annoncer une amélioration de classement ou de conversion avant de l'avoir observée dans les données.
