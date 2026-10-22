# Exécution et mesure — modifier, prouver, suivre

À lire avant de toucher à un site, de publier, ou d'organiser un suivi récurrent. Suppose
qu'un lot borné a déjà été décidé dans `cadre-operatoire.md`.

---

## 1. Avant d'écrire une ligne

- **Relever la base de comparaison**, si ce n'est pas fait : impressions, clics, CTR,
  position moyenne, état d'indexation des URL concernées, avec la date.
- **Noter le SHA de départ.** Tout ce qui suit se vérifie sur un état Git identifiable.
- **Confirmer l'autorité de publication** pour cette plateforme précisément.
- **Une variable majeure à la fois par page.** Changer simultanément le titre, la structure
  et le maillage rend l'effet illisible : dans six semaines, on ne saura pas ce qui a agi.

## 2. La chaîne à traiter

Une modification SEO n'est pas un texte : c'est une chaîne. En traiter un maillon et
abandonner les autres ne produit rien.

**Le contenu.** Répondre à l'intention lue en SERP, dès le début de la page. Une réponse
qui arrive au tiers de la page est une réponse perdue.

**Les métadonnées.** Titre et méta-description écrits pour être cliqués, pas pour contenir
la requête. Le titre porte l'intention et le bénéfice ; la description donne la raison de
cliquer plutôt que sur le résultat au-dessus.

**Le canonical.** Une seule URL canonique par intention. Vérifier qu'elle est
auto-référente, absolue, et qu'elle ne pointe pas vers une page redirigée.

**Le maillage interne.** Des liens depuis les pages qui ont déjà de l'autorité vers la page
visée, avec des ancres descriptives. C'est le levier le moins coûteux et le plus négligé.

**Le sitemap.** La page y figure, avec une date de modification honnête. Une date rafraîchie
sans modification réelle est un signal détérioré.

**Le rendu crawlable.** Le contenu doit exister dans le HTML servi, pas seulement après
exécution du JavaScript. Le vérifier en récupérant la page sans navigateur, pas en la
regardant à l'écran.

**Le CTA et la conversion.** La page mène à l'action décidée, et cette action est mesurée.
Une page qui monte sans convertir n'est pas un succès : c'est un coût.

**Les données structurées.** Elles décrivent ce que la page contient réellement. Ne jamais
déclarer un prix, un avis, une note, une certification ou une disponibilité que la page ou
le produit ne portent pas. Une donnée structurée trompeuse est une sanction différée.

## 3. Vérifier

Trois vérifications distinctes, à ne pas confondre dans le rapport.

**Automatique** — validateur de données structurées, contrôle des liens, rendu sans
JavaScript, codes de réponse, présence au sitemap, poids et vitesse.

**Manuelle** — lire la page en entier. Un scan ne détecte ni une promesse illégale, ni une
phrase qui ment, ni un paragraphe qui répond à côté. Relire aussi **le diff complet**, pas
seulement le morceau modifié.

**Non vérifié** — tout ce qui n'a pu l'être, et pourquoi. Cette ligne doit exister dans le
rapport ; son absence est en soi un défaut.

Vérifier techniquement **et** visuellement sur **le même état Git**. Une capture prise avant
un correctif ne prouve rien de ce qui est en ligne.

## 4. Publier

Quand la publication est autorisée :

1. Valider une **Preview du SHA exact** — pas d'une branche, pas d'un « à peu près ».
2. **Promouvoir cet artefact précis.** Ne jamais reconstruire à la volée : on déploierait
   autre chose que ce qui a été vérifié.
3. **Contrôler la production immédiatement** : la page répond, affiche le bon contenu,
   porte les bonnes métadonnées, et le SHA en ligne est celui qui a été validé.
4. Demander l'inspection de l'URL et l'indexation pour une page nouvelle ou refondue.

Deux règles qui ne se négocient pas : l'autorisation de déployer une plateforme ne s'étend
jamais à une autre, et aucun contrôle de sécurité du dépôt ne se contourne pour accélérer
un lot.

## 5. Consigner

Une entrée de journal par lot, sans quoi la boucle ne se referme pas :

| Date | Plateforme | Lot | Hypothèse | Métrique de succès | Base de comparaison | SHA | Preview | Production | Relevé prévu le |
|---|---|---|---|---|---|---|---|---|---|

Sans SHA ni date, un résultat n'est rattachable à aucune cause. Le journal est ce qui
distingue un système d'une suite d'interventions.

## 6. Mesurer

**Laisser le temps agir.** Une modification de titre se lit en deux à quatre semaines sur
les impressions et le CTR. Un changement de structure ou une page neuve demandent plus.
Conclure au bout de trois jours produit des décisions fausses.

**Les jalons, dans l'ordre** — c'est ainsi que se formule une ambition, jamais par une
promesse de position :

1. la page est indexée ;
2. elle prend des impressions ;
3. elle entre dans le top 20 ;
4. elle entre dans le top 10 ;
5. elle entre dans le top 3 ;
6. son CTR progresse ;
7. elle convertit.

**Lire les bons signaux.** Beaucoup d'impressions et peu de clics : problème de titre ou
d'extrait. Des clics et pas de conversion : problème d'intention ou de page. Aucune
impression après plusieurs semaines : problème d'indexation ou de rendu, pas de contenu.

## 7. Décider la suite

Chaque relevé se termine par **une** décision, choisie pour son rapport impact/preuve/effort :

- consolider une page déjà visible entre les positions 4 et 20 — c'est presque toujours le
  meilleur rendement ;
- réécrire un titre à fortes impressions et faible CTR ;
- corriger une erreur d'indexation, de canonical ou de rendu ;
- renforcer le maillage vers une page stratégique ;
- travailler le passage du trafic à la conversion ;
- créer une page **seulement** si une intention distincte et un contenu substantiel sont
  prouvés.

Une semaine n'impose pas une nouvelle page. Le réflexe à combattre est la production : sur
un site existant, consolider bat créer dans la grande majorité des cas.

## 8. Suivi récurrent

Un rythme régulier, court, avec toujours les mêmes points : évolution depuis le dernier
relevé, jalons franchis, erreurs de couverture apparues, pages qui décrochent,
cannibalisations nouvelles, et la décision suivante. Si un lot n'a rien donné, l'écrire —
une hypothèse réfutée est un résultat, pas un échec à masquer.
