# Base Airtable des publications LinkedIn

## Emplacement

- Base : `Publications LinkedIn — Rose YEMELI`
- Espace de travail : `SmartDataPayWorkspace` (`wspnJ4x2GQCKQqXNq`)
- Base ID : `appI4bPSnzkCj2Ysn`
- Accès : `https://airtable.com/appI4bPSnzkCj2Ysn`
- Table principale `Publications` : `tbl4Zy5t0CqtwQJAT`
- Table historique `Relevés de performance` : `tblSW5xMFPPz6s3dd`
- Table historique globale `Performances du profil` : `tbleicw35NAH3y8qV`
- Table de traçabilité `Journal d’import` : `tblrxDPsJ3xhaDfMM`
- Table partagée des vidéos `Capsules LinkedIn` : `tblB2qlohhqLZsMu2`
- Interface `Pilotage LinkedIn — Rose` : `pbdQNu75GMwawgDgC`
- Page bibliothèque : `pagSlUqCbKz5JU4BV`
- Page calendrier des programmations : `pag3BvBbPhKNgqLrP`
- Page historique des performances : `pagkr4MzSbuvWyVku`
- Page performances globales du profil : `pagDxrh3Vwctxt6hE`
- Page couverture de l’import : `pagz8WEOAw4gmxklh`
- Page capsules LinkedIn : `pagDBiCKFNrzuY7nZ` — brouillon créé le 3 septembre 2026, à publier uniquement après validation explicite de Rose.
- État de l’interface : publiée le 3 septembre 2026.

Cette base dans `SmartDataPayWorkspace` est la seule base active du workflow. L’ancienne base `appUvDXWqiIcFBclS`, conservée temporairement comme sauvegarde de migration, ne doit plus recevoir aucune écriture.

Toute modification ultérieure de l’interface crée un nouveau brouillon. Ne publier ces changements qu’après validation explicite de Rose, car cette action modifie la version visible de l’interface.

Utiliser les outils Airtable connectés. Rechercher la base et relire son schéma si un identifiant ne fonctionne plus au lieu de recréer une base parallèle.

## Règle anti-doublon

Avant toute proposition de sujet, rechercher au minimum :

- le thème et le sous-thème ;
- les mots distinctifs du titre et de la question du sondage ;
- les formulations voisines dans le texte intégral.

Un même thème peut être repris avec un angle réellement différent. Signaler à Rose la publication la plus proche, sa date, son angle et ses performances disponibles. Ne pas déclarer un doublon sur la seule présence d’un mot commun.

Ordre de rapprochement lors d’un import : identifiant LinkedIn, URL LinkedIn, empreinte anti-doublon, puis comparaison manuelle du titre et de l’angle. Ne pas fusionner automatiquement deux fiches ambiguës.

## Champs structurants — Publications

| Champ | ID |
|---|---|
| Titre | `fldPT6KWKOhzZ48Df` |
| Identifiant LinkedIn | `fldHxsX3qBnNAM5WT` |
| URL LinkedIn | `fldVfERDDkWezVmLj` |
| Date de publication — texte source | `fldPUdEjAkt97paDL` |
| Date programmée — texte source | `fldEPoQMnVgSVc87u` |
| Publication (date/heure) | `fldXxNo2ldCEZxoVA` |
| Programmation (date/heure) | `fldCK0KZJfKKL8Mu0` |
| Statut | `fldapM92M7VmkpqNG` |
| Série | `fldA7kWbUc5KCUQWs` |
| Thème | `fldnTQ76NDuNKzFBf` |
| Sous-thème | `fld9b8yYkaIqLZHQF` |
| Format | `fldTZn6jn474yGb7Z` |
| Texte intégral | `fldUdKImY0pBEvLqh` |
| Question du sondage | `fldkGyxb0CAQlAWZs` |
| Bonne réponse | `fldVpgktMjwuJcO1Z` |
| CTA | `fldOAA55Qgx8KnSKw` |
| Lien CTA | `fld3A3nlPI4w5YWmU` |
| Sources officielles | `fldzoQSdoQJRj0Y9w` |
| Vérification juridique | `fld6JzdcHLMs1oRo4` |
| Empreinte anti-doublon | `fldZFmDpFyJAqDtIx` |
| Doublon potentiel | `fldIv6hP4rbmX4qeA` |
| Qualité du classement | `fldbrPQnZsioPJaDH` |
| Qualité du texte | `fldaDpoi82LULbnbM` |
| Relevés de performance | `fldZELRapyBJckGcI` |

Les options du sondage, les hashtags, les indicateurs actuels et les notes sont également dans le schéma. Relire le schéma Airtable pour obtenir leurs identifiants lorsqu’ils doivent être modifiés.

## Champs structurants — Capsules LinkedIn

| Champ | ID |
|---|---|
| Capsule | `fldjDjw36PAtL9ofi` |
| Thème | `fldCNlA3F1vVBlfN5` |
| Statut de la capsule | `fldWdmysWgLeJf25k` |
| Variante retenue | `fldhl54Rm9HLSzGJR` |
| Chemin vidéo neutre | `fld0MkbK678gYBM1H` |
| Chemin vidéo CTA WhatsApp | `fldgrNIBJpyTFqPpS` |
| RoseVidéo — ID neutre | `fldkBttDPscvPUSAm` |
| RoseVidéo — ID CTA | `fld3C2htisgQszfYB` |
| RoseVidéo — statut neutre | `fldROMlDTH6AiD5rX` |
| RoseVidéo — statut CTA | `fldCeg0LFl5bu5hlm` |
| Transcription | `fldeKMn2prehXS4zu` |
| Publications LinkedIn | `fldxpHq0oUtdnQIyY` |
| Empreinte média | `fldbwZEl3CILNwTTd` |
| Notes | `fld4KjqXu6AulBjwT` |

Le lien inverse créé dans `Publications` est `Capsules LinkedIn` (`fldA1amIDZKCzXGXw`).

La table contient 105 fichiers carrés neutres rapprochés de leurs 105 variantes CTA WhatsApp. L’unicité repose sur `thème/nom_du_fichier`, car un même nom de capsule peut exister dans deux thèmes différents. Ne jamais dédupliquer sur le seul nom du fichier.

## Hébergement des vidéos — RoseVidéo

Rose a choisi sa plateforme auto-hébergée **RoseVidéo** comme hébergeur vidéo central. Ne pas utiliser les pièces jointes Airtable ni OneDrive comme hébergeur principal.

- Service en ligne : `https://video.roseyemeli.com`
- Projet local de référence : `C:\Users\roses\Downloads\rosevideo`
- Code de l’application : `C:\Users\roses\Downloads\rosevideo\app`
- Déploiement VPS : `/opt/rosevideo`, derrière nginx. La configuration de production vérifiée le 3 septembre 2026 stocke les médias dans `/opt/rosevideo/data/media` ; la valeur par défaut du code, hors configuration, est `app/data/media`.
- Dépôt par API : `POST /api/upload`, authentifié par `X-API-Key`. Récupérer le secret depuis sa configuration autorisée ; ne jamais le copier dans Airtable, dans ce skill, dans une commande affichée ou dans un journal.

RoseVidéo transcode la vidéo en HLS puis supprime le fichier source téléversé. Elle fournit donc une copie de diffusion, mais pas une archive binaire identique au MP4 d’origine. L’interface administrateur peut reconstruire un MP4 à partir de la meilleure piste HLS via `GET /api/download/:id`, réservé à l’authentification administrateur et non à la clé API.

Tant que RoseVidéo ne conserve pas explicitement les sources originales, garder le MP4 local ayant réellement servi à LinkedIn. Dans Airtable, conserver son chemin exact et, après hébergement, l’identifiant RoseVidéo et l’URL de lecture dans des champs dédiés lorsqu’ils existent. Avant un envoi en lot, vérifier l’espace disponible sur le VPS, la catégorie cible et la variante à héberger ; le transcodage est traité dans une file d’attente à un seul job.

Les statuts d’hébergement utilisés dans Airtable sont `À héberger`, `Traitement`, `Prête` et `Erreur`. Ne passer une variante à `Prête` qu’après lecture de son statut `ready` dans l’API RoseVidéo. L’identifiant RoseVidéo est permanent ; ne pas enregistrer comme URL canonique un lien de partage signé qui expire.

Décision de Rose du 3 septembre 2026 : l’hébergement se fait **au fur et à mesure des publications**. Ne jamais envoyer les 105 capsules ou leurs deux variantes en masse. Pour chaque publication, héberger uniquement la variante retenue (`Neutre` ou `CTA WhatsApp`), puis écrire son identifiant permanent et son statut vérifié dans Airtable. Laisser l’autre variante à `À héberger` tant qu’elle n’est pas réellement utilisée.

Lorsqu’une tâche prépare une vidéo LinkedIn :

1. Rechercher son empreinte `capsule:<thème>/<nom_sans_extension>`.
2. Vérifier les publications déjà liées et leur statut avant de réutiliser la capsule.
3. Après validation de Rose, relier la capsule à la fiche `Publications` au format `Vidéo` et conserver le statut `Validée` tant que LinkedIn n’a pas confirmé la programmation.
4. Reporter la variante réellement utilisée : `Neutre` ou `CTA WhatsApp`.
5. Après programmation ou diffusion réellement vérifiée, mettre à jour les statuts des deux fiches. Ne jamais considérer le simple chargement du fichier dans l’éditeur comme une programmation réussie.

## Cycle de vie d’une fiche

1. Après validation du texte par Rose, créer la fiche si elle n’existe pas et choisir le statut `Validée`.
2. Après programmation confirmée dans LinkedIn, enregistrer le texte relu dans LinkedIn, le statut `Programmée`, la date/heure structurée, le sondage exact et ses options.
3. Après diffusion, passer au statut `Publiée`, renseigner la date/heure effective, l’identifiant LinkedIn et l’URL canonique.
4. Conserver les séparateurs U+2800 dans `Texte intégral` afin que la fiche reflète les vrais espacements du post.
5. Pour un contenu juridique importé sans nouvel audit de fond, choisir `À vérifier`. Utiliser `Vérifiée` uniquement après lecture et compréhension des sources officielles.

## Relevés de performance

Chaque mesure datée est une nouvelle ligne de `Relevés de performance`, reliée à la publication par le champ `Publication` (`fldjBwkYZbJGxi5zK`). Renseigner la date du relevé et le mode de collecte.

Mettre aussi à jour les champs « actuels » de la fiche Publication pour faciliter le tri, mais ne jamais supprimer ni remplacer les relevés antérieurs. Une valeur inconnue reste vide. Un zéro signifie que LinkedIn affichait réellement zéro au moment du relevé.

Les impressions constituent l’indicateur central demandé par Rose. Ajouter, lorsqu’ils sont disponibles, les membres atteints, réactions, commentaires, republications, clics, vues vidéo et votes du sondage.

## Performances globales du profil

Créer une nouvelle ligne dans `Performances du profil` pour chaque période mesurée. Ne jamais remplacer un ancien relevé. Enregistrer les dates de début et de fin, la date du relevé, les impressions, les membres atteints, les engagements et les autres indicateurs disponibles dans LinkedIn Analytics.

Le premier relevé couvre la période du 3 septembre 2025 au 2 septembre 2026. Il a été lu directement dans LinkedIn Analytics le 2 septembre 2026. LinkedIn ne proposait pas, dans l’interface consultée, une période prédéfinie supérieure à 365 jours.

## Import historique depuis LinkedIn Analytics

La vue annuelle des meilleures publications peut plafonner autour de 50 résultats. Pour approcher l’historique complet, interroger des périodes mensuelles personnalisées et dédupliquer chaque résultat par identifiant LinkedIn avant toute création.

Le parseur réutilisable se trouve dans `scripts/linkedin-analytics-parser.mjs`. Il filtre chaque résultat à partir de la date réellement encodée dans l’identifiant LinkedIn afin d’écarter une page mensuelle précédente qui resterait brièvement affichée pendant le chargement.

Chaque période contrôlée doit être inscrite dans `Journal d’import`, avec son statut, le nombre de publications présentes dans la base et une note explicite lorsque LinkedIn ne restitue aucune donnée. Une période vide ne doit jamais être déduite d’un simple échec de chargement : la relancer et la confronter à la vue annuelle avant de la marquer `Aucune donnée`.

Au 3 septembre 2026, le premier chantier d’import contient 878 fiches : 872 publications LinkedIn datées et 6 publications programmées. La couverture exploitable va de décembre 2023 au 3 septembre 2026. Les 872 identifiants de publications sont uniques et toutes les publications diffusées ont au moins un relevé de performance relié.

Les textes obtenus depuis les listes LinkedIn Analytics sont complets pour la recherche, mais leur mise en forme est aplatie. Les marquer `Complet, mise en forme aplatie`. Les textes lus depuis l’activité récente ou la liste des publications programmées conservent les séparateurs U+2800 et sont marqués `Exact avec mise en forme`.

Limite de l’import historique : LinkedIn Analytics ne restitue pas systématiquement les anciennes options de sondage ni les sources qui avaient servi à rédiger la publication. Au 3 septembre 2026, 236 fiches sont identifiées comme sondages, mais seules 17 disposent d’au moins deux options historiques récupérées. Les sources anciennes restent vides tant qu’elles n’ont pas été réauditées. Ne pas interpréter ces champs vides comme la preuve qu’il n’existait ni options ni sources ; les compléter uniquement à partir d’une preuve retrouvée, sans les inventer.
