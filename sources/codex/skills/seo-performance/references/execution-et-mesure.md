# Exécution, publication et mesure

Lire ce document lorsqu'un site doit être modifié, publié ou amélioré à partir des données SEO.

## 1. Brief avant modification

Consigner avant de coder :

- intention et page responsable ;
- problème observé et données de départ ;
- public et niveau de maturité ;
- promesse de réponse ;
- preuve produit et sources métier ;
- CTA et événement de conversion ;
- pages de maillage entrantes et sortantes ;
- métrique, période d'observation et seuil de réussite ;
- surface technique touchée et niveau de risque.

Formuler une hypothèse testable. Éviter de changer simultanément plusieurs variables majeures sur une page lorsque cela empêcherait de comprendre l'effet.

## 2. Choisir et exécuter l'action

Privilégier, dans cet ordre lorsque les preuves le justifient :

- réparer une erreur qui bloque l'exploration, le rendu, l'indexation, le canonical ou la mesure ;
- consolider une page qui se classe déjà ou résoudre une cannibalisation ;
- améliorer un titre et un extrait ayant beaucoup d'impressions mais un CTR faible ;
- compléter une réponse trop faible par rapport à l'intention réellement observée ;
- renforcer le maillage vers une page stratégique ;
- améliorer le passage du trafic organique vers l'inscription, le devis, l'achat ou le contact ;
- créer une nouvelle page seulement pour une intention distincte, utile et suffisamment substantielle.

Dans un dépôt autorisé, modifier réellement le code ou le contenu et dérouler la vérification sans s'arrêter à un plan. Si la production n'est pas autorisée, aller jusqu'au dernier état sûr et vérifiable : branche ou worktree propre, tests, Preview ou artefact lorsque disponible.

## 3. Chaîne d'implémentation

Selon l'architecture du site, vérifier l'ensemble pertinent :

- URL stable et route publique ;
- titre, description, H1 et hiérarchie des titres ;
- canonical, robots et éventuels hreflang ;
- contenu substantiel répondant directement à l'intention ;
- rendu initial réellement lisible par un robot lorsque l'application l'exige ;
- sitemap et date de modification seulement lorsqu'elle est significative ;
- données structurées correspondant au contenu visible ;
- maillage interne descriptif ;
- CTA accessible et destination exacte ;
- paramètres UTM ou événements analytiques non sensibles ;
- cohérence mobile, performance et accessibilité.

Ne jamais ajouter un schéma, une FAQ ou un mot-clé simplement parce qu'un outil le recommande. Chaque élément doit servir l'utilisateur et rester vrai.

## 4. Vérification proportionnée au risque

### Automatique

- tests ciblés et suite pertinente ;
- typage, lint et build ;
- statut HTTP ;
- titre, description, canonical, robots, H1 et sitemap ;
- liens cassés, erreurs réseau et débordement horizontal ;
- présence et destination des événements de conversion.

### Manuelle

- lecture complète du contenu modifié ;
- exactitude des affirmations et respect des nuances ;
- adéquation réelle à l'intention observée dans Google ;
- absence de duplication ou de cannibalisation ;
- rendu visuel sur ordinateur et mobile ;
- compréhension du changement de domaine ou du passage vers un tiers ;
- diff complet et absence de modification hors périmètre.

### À déclarer comme non vérifié

- classement futur ;
- indexation tant que Search Console ne la confirme pas ;
- conversion sans événement observé ;
- fonctions d'un produit non testées dans un compte ;
- conformité ou exactitude métier non établie par une source compétente.

Un scan automatique prouve seulement les contrôles qu'il exécute. Il ne remplace ni la lecture éditoriale ni la validation métier.

## 5. Publication sûre

Respecter les règles du dépôt et l'autorisation propre à la plateforme.

1. Isoler le lot et préserver les changements existants.
2. Tester un SHA propre et identifiable.
3. Vérifier que le diff reste dans le périmètre autorisé.
4. Construire une Preview de ce SHA.
5. Contrôler la Preview par HTTP et dans un vrai navigateur.
6. Intégrer sans force-push et sans écraser d'autre travail.
7. Promouvoir de préférence l'artefact Preview déjà vérifié.
8. Prouver le SHA et l'état du déploiement.
9. Refaire les contrôles essentiels sur le domaine public et consulter les erreurs runtime.
10. Si la production régresse, appliquer le mécanisme de retour arrière autorisé et en prouver le résultat.

Une autorisation éditoriale ne couvre pas automatiquement paiement, authentification, permissions, base de données, secrets, mentions légales, communications externes ou règles métier sensibles.

## 6. Mesure du parcours

Relier autant que possible :

`requête → impression → clic organique → page → CTA → inscription/devis → activation → client`.

Suivre par page et groupe d'intentions :

- couverture et indexation ;
- impressions hors marque ;
- clics organiques ;
- position médiane et distribution top 20/top 10/top 3 ;
- CTR ;
- clics vers le produit ;
- conversion principale ;
- valeur commerciale disponible sans exposer de donnée personnelle.

Conserver une base datée avant chaque lot. Comparer des périodes de durée cohérente, notamment les 28 derniers jours avec les 28 jours précédents lorsque le volume le permet, et utiliser les 7 derniers jours seulement comme signal directionnel. Signaler la saisonnalité, les changements de tracking, les migrations et les évolutions produit.

Ne pas attribuer une variation à un lot SEO sans preuve suffisante. Lorsque plusieurs facteurs ont changé, parler de corrélation observée et maintenir l'incertitude.

## 7. Fenêtre d'observation et réaction

Ne pas modifier trop vite une page récemment publiée. Conserver pour chaque lot une date de réévaluation adaptée au volume, à la fréquence d'exploration et à l'ampleur du changement.

Intervenir sans attendre la fenêtre normale en cas d'erreur technique, désindexation, chute anormale, contenu devenu faux ou parcours de conversion cassé. Sinon, laisser les données s'accumuler et sélectionner une autre page ou intention pendant l'observation.

## 8. Automatisations déterministes

Créer ou adapter dans le projet les scripts utiles lorsqu'une opération est stable et répétée : statuts HTTP, canonical, sitemap, doublons de métadonnées, liens cassés, extraction structurée ou comparaison de mesures.

Tout script doit avoir des entrées et sorties explicites, un mode lecture seule ou aperçu par défaut, une limite de portée et de coût, des erreurs visibles et un test sur environnement isolé. Ne jamais transformer une décision éditoriale, juridique ou métier en règle mécanique.

La tâche hebdomadaire orchestre ces contrôles, mais conserve le jugement sur l'intention, la priorité et la qualité du contenu.
