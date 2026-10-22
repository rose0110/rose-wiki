# La convention collective — l'identifier, la consulter, en tirer ce que le contrat exige

Aucun contrat ne se rédige sans avoir ouvert la convention collective (CCN) du client. Elle
fixe des règles que le Code du travail ne donne pas (classification, minimum, période d'essai,
préavis, primes, prévoyance) et elle prime sur le contrat dès qu'elle est plus favorable au
salarié. **On ne cite jamais une CCN de mémoire : on l'ouvre.**

---

## 1. Identifier la CCN applicable (numéro IDCC)

Dans l'ordre, jusqu'à obtenir un IDCC sûr :

1. **Le bulletin de paie du client** : l'intitulé de la CCN y est obligatoire. C'est la source
   la plus fiable — demander un bulletin récent d'un autre salarié.
2. **La déclaration en DSN**, lisible via l'API publique des entreprises :
   ```bash
   curl -s "https://recherche-entreprises.api.gouv.fr/search?q=<SIREN ou nom>"
   ```
   Champ `complements.liste_idcc` (ex. `["3127"]`) — c'est ce que l'entreprise déclare chaque
   mois. Si l'outil `curl` n'est pas disponible, ouvrir l'URL avec l'outil de récupération web.
   La même réponse donne le SIREN, le SIRET du siège, la forme juridique, le NAF, l'adresse
   et le dirigeant : vérifier ces données contre le brouillon du client (les sièges changent).
3. **Le code NAF** n'est qu'un indice : la CCN dépend de l'**activité principale réelle**
   (champ d'application de la convention), pas du code. Utile pour repérer une incohérence
   (un IDCC déclaré qui ne correspond pas du tout à l'activité), pas pour décider.
4. **IDCC 9999** ou liste vide = l'entreprise déclare **ne relever d'aucune CCN**. Le vérifier
   avec le client : c'est souvent une erreur de paramétrage, et une CCN étendue s'applique de
   plein droit à toute entreprise entrant dans son champ.

Si le doute subsiste après ces quatre points : **demander au client** (ou à la responsable du
cabinet), en disant ce qui a été vérifié. Ne jamais choisir une CCN « probable ».

## 2. Consulter le texte

- **code.travail.gouv.fr/convention-collective/<IDCC>** — le site officiel du ministère
  redirige vers la page de la CCN (ex. `…/convention-collective/3127` → entreprises de
  services à la personne). On y trouve le texte, les thèmes (période d'essai, préavis,
  congés, indemnités…) et les **outils de calcul** qui appliquent la CCN et le Code ensemble.
- **Légifrance, base KALI** — le texte intégral consolidé, **les grilles de salaires dans les
  avenants « salaires »**, et pour chaque avenant sa date et son **statut d'extension**. Lien
  « Consulter sur Légifrance » depuis la page code.travail.gouv.fr.

Un avenant **non étendu** ne s'applique qu'aux entreprises adhérentes des organisations
patronales signataires : pour un client non adhérent, prendre le **dernier avenant étendu**.
Toujours noter la **date** de la grille utilisée — elle figure dans le dossier, pas dans le contrat.

## 3. Ce qu'on va chercher dans la CCN pour un contrat

| Point | Où dans la CCN | Ce qu'on en fait dans le contrat |
|---|---|---|
| **Classification** | Grille de classification (niveaux, coefficients, échelons, catégories) | Article « Engagement et fonctions » : intitulé du poste, catégorie, niveau/coefficient exacts. Ne jamais copier le coefficient d'un autre salarié. |
| **Minimum conventionnel** | Dernier avenant « salaires » étendu | Comparer au salaire proposé **et au SMIC** ; le plus élevé s'applique. Si le minimum est sous le SMIC, le SMIC prime — l'écrire. Pour un temps partiel : proratiser le minimum mensuel. |
| **Période d'essai** | Chapitre « embauche » / « période d'essai » | Durée par catégorie ; **renouvellement possible seulement si la CCN étendue le prévoit** (art. L. 1221-21) — sinon aucune clause de renouvellement. Depuis le 09/09/2023, aucune CCN ne peut plus dépasser les maxima légaux (2/3/4 mois). |
| **Préavis** | Chapitre « rupture » | Durée par catégorie et ancienneté, pour la démission et le licenciement. |
| **Temps partiel** | Chapitre « durée du travail » ou accord de branche spécifique | Une **durée minimale dérogatoire** aux 24 h existe-t-elle ? Les **heures complémentaires** peuvent-elles aller jusqu'au 1/3 (au lieu du 1/10) et à quel taux ? **Délai de prévenance** de modification des horaires (7 jours ouvrés par défaut, la CCN peut le réduire à 3). **Avenant de complément d'heures** autorisé (art. L. 3123-22) ? |
| **Heures supplémentaires** | Durée du travail | Taux de majoration s'ils diffèrent des 25 %/50 % légaux ; contingent annuel. |
| **Congés, jours fériés** | Chapitre « congés » | Congés supplémentaires (ancienneté, événements familiaux), jours fériés chômés payés, ponts. |
| **Primes** | Salaires / avantages | Prime d'ancienneté (barème, assiette), 13ᵉ mois, prime de vacances, indemnités de repas/transport, majorations dimanche/nuit/jours fériés. Ce qui est obligatoire se mentionne. |
| **Prévoyance et frais de santé** | Chapitre « protection sociale » / accord dédié | Régimes obligatoires de branche, taux, **organismes recommandés** ; la part employeur minimale. **Mention obligatoire dans un CDD** (art. L. 1242-12). |
| **Retraite complémentaire** | — | Caisse AGIRC-ARRCO du client (nom exact) — mention obligatoire dans un CDD. |
| **Forfait jours** | Accord de branche sur le temps de travail | N'est possible que si un **accord collectif** le prévoit (branche ou entreprise) et pour des salariés **réellement autonomes** ; nombre de jours, suivi de la charge, entretien annuel. Sans accord : pas de forfait jours. |
| **Clauses particulières** | Selon la CCN | Dédit-formation, mobilité (zone précise), astreintes, indemnité de licenciement conventionnelle (à mentionner dans l'information écrite). |
| **Statut cadre** | Classification | Fait basculer la période d'essai, le préavis, la prévoyance 1,50 % tranche A, la cotisation APEC. |

## 4. Hiérarchie — qui l'emporte

1. **Loi d'ordre public** (SMIC, durées maximales, 24 h de temps partiel sauf exceptions…) : rien ne peut y déroger en défaveur du salarié.
2. **CCN** : s'applique à tous les salariés de l'entreprise si elle est étendue, même sans mention au contrat. Un contrat qui donne moins que la CCN est corrigé par la CCN.
3. **Contrat** : ne peut faire que **mieux** que la CCN pour le salarié (salaire plus élevé, essai plus court, congés en plus).

## 5. Ce qu'on écrit dans le contrat

Un article « Convention collective » avec **l'intitulé exact** et **l'IDCC** :

> Le présent contrat est soumis à la convention collective nationale [intitulé exact tel
> qu'il figure sur Légifrance] (IDCC [numéro]), dont un exemplaire est tenu à la disposition
> du Salarié [sur le lieu de travail / sur l'intranet]. Le Salarié relève de la catégorie
> [catégorie], niveau [X], coefficient [Y] de la classification conventionnelle.

Et dans le dossier (pas dans le contrat) : la date de la grille de salaires utilisée, le
minimum trouvé, et la comparaison faite.
