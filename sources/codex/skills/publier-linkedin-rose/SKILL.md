---
name: publier-linkedin-rose
description: Préparer, réviser, valider, saisir, programmer et publier les contenus LinkedIn de Rose YEMELI, notamment ses séries thématiques sur la paie et le droit du travail, ses publications pédagogiques et ses sondages. Utiliser dès que Rose parle d’une publication, d’un post, d’un sondage, d’un quiz, d’une série ou d’une programmation LinkedIn, demande une action sur son profil LinkedIn, ou formule une préférence ou une correction concernant son style LinkedIn. Conserver les remarques durables de Rose dans le guide de style évolutif du skill.
---

# LinkedIn de Rose

## Démarrage obligatoire

Lire entièrement [references/style-guide.md](references/style-guide.md) avant de rédiger, corriger ou saisir une publication.

Avant de proposer un nouveau sujet ou de reprendre une série, consulter la base Airtable décrite dans [references/airtable-publications.md](references/airtable-publications.md). Cette base est la mémoire centrale des contenus déjà publiés, validés ou programmés et de leurs performances. Ne pas se fier uniquement à l’historique de la conversation pour écarter un doublon.

Pour une publication vidéo LinkedIn, consulter aussi la table `Capsules LinkedIn` de cette même base. Elle mutualise les vidéos disponibles, leurs variantes et leur lien avec les publications, y compris lorsque plusieurs tâches Codex travaillent en parallèle. Ne pas maintenir un calendrier vidéo séparé comme source de vérité.

Pour toute règle de paie, de droit du travail ou de fiscalité, rechercher les textes à jour dans les sources officielles pertinentes : Légifrance, BOSS, Urssaf, BOFiP, Service Public ou ministère du Travail. Comprendre manuellement les sources avant de présenter le contenu comme vérifié.

Pour toute interaction avec LinkedIn, utiliser la compétence de contrôle du navigateur et sa session connectée. Ne jamais annoncer une publication ou une programmation sans un signal de réussite visible dans LinkedIn.

## Flux de travail

1. Rechercher dans Airtable le thème, le sous-thème et les formulations proches afin d’identifier les publications antérieures et les doublons possibles.
2. Déterminer le sujet, l’angle pédagogique et le jour visé. Poser une seule question à Rose si une information indispensable manque.
3. Effectuer les recherches officielles nécessaires et distinguer les règles, les exceptions et les éventuelles dates d’entrée en vigueur.
4. Rédiger la publication et le sondage conformément au guide de style.
5. Présenter le contenu complet à Rose pour validation. Ne pas saisir ni programmer le post tant qu’elle ne l’a pas validé explicitement.
6. Après validation, saisir le texte, ajouter le sondage et programmer ou publier au moment demandé.
7. Vérifier le texte, le sondage, l’heure et surtout les espacements avant le dernier clic. Lorsqu’un visuel, une vidéo ou un document a été validé avec le contenu, contrôler aussi dans l’aperçu LinkedIn que ce média est réellement joint et correctement affiché avant de publier ou programmer.
8. Après l’enregistrement, rouvrir le post programmé et vérifier que les espacements sont toujours présents.
9. Créer ou mettre à jour la fiche Airtable avec le texte réellement enregistré dans LinkedIn, la date, le statut, le sondage, les sources et l’empreinte anti-doublon. Après publication, compléter l’identifiant et l’URL LinkedIn dès qu’ils sont disponibles.

## Publications vidéo LinkedIn

- Utiliser une capsule de la table `Capsules LinkedIn` et vérifier qu’elle n’est pas déjà reliée à une publication programmée ou publiée sous le même angle.
- Pour LinkedIn, utiliser la vidéo carrée native prévue dans les champs `Chemin vidéo neutre` ou `Chemin vidéo CTA WhatsApp`. Les fichiers verticaux destinés aux YouTube Shorts restent dans un workflow séparé.
- L’hébergeur vidéo retenu par Rose est sa plateforme auto-hébergée **RoseVidéo**. Lire la section dédiée dans [references/airtable-publications.md](references/airtable-publications.md) avant une opération d’hébergement ou de synchronisation. Ne pas proposer Airtable ou OneDrive comme hébergeur vidéo principal.
- Héberger les capsules **au fur et à mesure**, jamais par téléversement massif de toute la bibliothèque. Quand Rose choisit une capsule et sa variante, téléverser seulement cette variante si son identifiant RoseVidéo est encore vide ; réutiliser l’identifiant existant lorsqu’elle est déjà prête.
- Dès que Rose valide le post, créer ou mettre à jour sa fiche dans `Publications`, choisir le format `Vidéo` et la relier à la capsule. Le statut de la fiche `Publications` reste la référence pour savoir si le texte est validé, programmé ou publié.
- Mettre la capsule à `Sélectionnée` lors de son association à un contenu validé, à `Programmée` seulement après le signal de réussite visible dans LinkedIn, puis à `Publiée` après diffusion.
- Conserver dans Airtable le chemin exact du fichier téléversé et la variante réellement utilisée afin qu’une autre tâche puisse reprendre le travail sans relire toute la conversation.

## Historique et performances

Ne jamais écraser l’historique des performances. Mettre à jour les indicateurs actuels de la publication et créer en parallèle un nouveau relevé daté dans la table liée `Relevés de performance`.

Ne renseigner que les chiffres réellement visibles ou fournis par Rose. Laisser un champ vide lorsque LinkedIn ne fournit pas la donnée ; ne jamais convertir une absence de donnée en zéro.

Lorsque Rose demande de poursuivre une série, utiliser l’historique Airtable pour lui dire si le sujet a déjà été traité, quand, sous quel angle et avec quels résultats disponibles.

## Espacement LinkedIn obligatoire

LinkedIn peut supprimer les paragraphes vides lors d’une saisie automatisée. Ne pas se contenter de doubles retours à la ligne dans `fill()`.

Insérer une ligne contenant le caractère invisible U+2800 entre les paragraphes à espacer :

```text
Premier paragraphe.
⠀
Deuxième paragraphe.
```

Garder les éléments d’une même liste rapprochés lorsque cela améliore la lecture. Placer une ligne U+2800 avant et après la liste.

Contrôler les trois preuves suivantes :

- le DOM de l’éditeur contient des paragraphes dont le texte est `⠀` ;
- une capture visuelle montre un espace réel entre les blocs ;
- le post rouvert après enregistrement contient encore ces séparateurs.

## Validation et action

Traiter « c’est bon », « je valide » ou « oui » comme une validation du contenu seulement lorsque le contexte est sans ambiguïté. Pour une programmation, connaître la date et l’heure exactes avant le dernier clic.

Respecter les confirmations requises par l’outil de navigation au moment de toute action représentative. Ne jamais publier une nouvelle version d’un texte que Rose n’a pas validé.

## Apprentissage continu

Lorsqu’une remarque de Rose exprime une préférence durable — par exemple « je fais toujours », « je n’aime pas », « la prochaine fois » ou une correction répétée — appliquer immédiatement la correction au travail en cours et mettre à jour [references/style-guide.md](references/style-guide.md) pendant le même tour.

Ne pas transformer en règle générale une modification manifestement propre à une seule publication. En cas de doute important, poser une seule question.

Après chaque modification du skill, exécuter `quick_validate.py` et signaler précisément ce qui a été ajouté à la mémoire.
