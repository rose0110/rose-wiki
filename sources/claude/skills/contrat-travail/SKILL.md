---
name: contrat-travail
description: Rédiger un contrat de travail (CDI, CDD, temps plein ou temps partiel, avenant, promesse d'embauche) au standard du cabinet — mise en page à la charte du client avec son logo (ou sans, si le client n'en a pas), consultation systématique de la convention collective (identification de l'IDCC, minima, période d'essai, temps partiel), contrôle de toutes les mentions obligatoires (CDI, CDD, temps partiel, information écrite R. 1221-34), et procédure complète pour un salarié étranger (titre de séjour, vérification préfecture, ANEF, registre, taxe). À utiliser dès qu'on demande un contrat de travail, un avenant, une promesse d'embauche, ou de corriger le contrat qu'un client a rédigé lui-même. Vaut pour tous les clients.
---

# Contrat de travail — standard du cabinet

Objectif : produire un contrat **meilleur que celui que le client rédigerait lui-même** : à sa
charte, complet, et juridiquement tenu. Le client doit voir la différence en l'ouvrant ; un
inspecteur du travail ne doit rien y trouver.

Cette compétence porte les règles que la gestionnaire n'a pas à connaître par cœur. **Elle est
faite pour être suivie dans l'ordre, sans sauter d'étape** — chaque étape renvoie à une fiche
du dossier `references/` à lire à ce moment-là (pas avant, pas de mémoire).

## Ordre de travail — ne jamais inverser

### 1. Rassembler les faits — jamais inventer

Une donnée introuvable se **demande** ; elle ne s'invente jamais, et on n'écrit jamais un
placeholder qui passerait pour une donnée. Chercher, dans l'ordre :

- **Le brouillon du client** s'il existe. C'est souvent un copier-coller du contrat d'un autre
  salarié : vérifier le nom dans le bloc signature, la durée du travail, le statut, le
  coefficient — les erreurs y sont fréquentes, et c'est ce qu'on corrige.
- **Les contrats antérieurs du même salarié** : CDD, avenants de prolongation, stage. Ils
  changent la période d'essai (déduction) et le motif d'un nouveau CDD (carence).
- **Les mails et documents transmis** par le client : dates d'embauche, motifs, décisions,
  bulletins de paie (qui donnent la CCN et la classification des collègues).
- **L'identité de l'employeur** par l'API publique :
  `curl -s "https://recherche-entreprises.api.gouv.fr/search?q=<nom ou SIREN>"`
  (ou l'outil de récupération web) → SIREN, SIRET du siège, forme juridique, NAF, adresse,
  **dirigeant en exercice**, **IDCC déclaré** (`complements.liste_idcc`). Vérifier que
  l'adresse et le signataire du brouillon sont encore les bons.
- **Le salarié** : état civil complet, nationalité, domicile, NIR, adresse électronique, titre
  de séjour si étranger.

Dire d'où vient chaque donnée dans le compte rendu.

### 2. Ouvrir la convention collective → lire `references/ccn.md`

Identifier l'IDCC (bulletin de paie, DSN via l'API, jamais « probable »), ouvrir le texte
(code.travail.gouv.fr/convention-collective/<IDCC>, Légifrance KALI), et en sortir :
classification et coefficient, **minimum conventionnel** (dernier avenant salaires **étendu**),
période d'essai et renouvellement, préavis, règles de temps partiel, primes obligatoires,
prévoyance / mutuelle / retraite complémentaire. Noter la date de la grille utilisée.

### 3. Passer les contrôles juridiques → lire `references/controles.md`

Le tableau des contrôles (salaire ≥ SMIC et ≥ minimum CCN, période d'essai et déduction des
CDD antérieurs, 24 h et répartition du temps partiel, heures complémentaires, forfait jours,
signataire, DPAE…), puis les **mentions obligatoires** du type de contrat (CDI, CDD à peine de
requalification, temps partiel à peine de présomption de temps complet, avenant), puis les
**14 informations écrites obligatoires** (R. 1221-34) que le contrat doit couvrir.

### 4. Salarié étranger → lire `references/salarie-etranger.md`

Dès que la nationalité n'est pas française. Trois cas : français (sans objet), UE/EEE/Suisse
(dispense, à écrire), hors UE (**liste de contrôle complète** : lecture du titre, titre qui vaut
ou non autorisation, demande ANEF si nécessaire, **vérification préfecture 2 jours ouvrables
avant l'embauche**, article dédié dans le contrat, registre du personnel, taxe employeur,
suivi de l'échéance). Un contrat ne prend jamais effet avant que le titre soit vérifié.

### 5. Un document par émetteur — ne jamais mélanger

**Un document qui émane du salarié ne porte JAMAIS l'en-tête ni le logo de l'employeur.**
Demande de temps partiel inférieur à 24 h, demande de congé sans solde, refus de modification
d'horaires, démission : simple courrier personnel (coordonnées du salarié en haut à gauche,
employeur en destinataire à droite). Sinon on donne l'impression que l'employeur l'a rédigé —
et la dérogation qu'il portait tombe. Pour ces lettres : laisser le **motif à écrire à la main**,
la date en pointillés, et dire au client que le salarié la date et la signe **avant ou le jour
même** de la signature du contrat.

### 6. Fabriquer le document → lire `references/logo-et-charte.md`

1. **Le logo et la charte du client** : chercher (documents transmis, site, signature de mail),
   convertir en PNG, extraire une couleur foncée et une couleur d'accent. **Sans logo** : mode
   sans logo du gabarit (nom du client à la place, charte sobre par défaut) — jamais bloquant,
   jamais une charte inventée.
2. Copier `gabarit-contrat.cjs` dans le dossier de travail, renseigner `CONFIG` (identités,
   titre, genre du salarié, logo ou `''`, couleurs), écrire les `ARTICLES` avec les données
   réelles et les clauses issues des étapes 2 à 4.
3. Générer, convertir, **regarder** :
   ```bash
   node gabarit-contrat.cjs                       # nécessite le paquet docx (npm install docx)
   soffice --headless --convert-to pdf "<fichier>.docx" --outdir .
   python -c "import fitz; d=fitz.open('<fichier>.pdf'); print(len(d),'pages'); [d[i].get_pixmap(dpi=100).save('p%d.png'%(i+1)) for i in range(len(d))]"
   ```
   Outils et chemins : `references/installation.md`. Claude installe lui-même ce qui manque.

**La mise en page** (validée, ne pas la réinventer) : page 1 avec logo à gauche (ou nom du
client) et titre à droite, filet d'accent, **les deux parties en tableaux** à bandeau foncé ;
**articles en bandeaux pleins** de la couleur foncée, texte blanc ; en-tête discret sur les
pages suivantes ; pied de page avec **cases de paraphe encadrées** (une par partie), mentions
légales et **« Page X / Y »** ; **pas de paraphe sur la page des signatures** (deuxième section
du document) ; bloc signatures encadré en deux colonnes avec 2 cm pour signer et la mention
« lu et approuvé » côté salarié.

### 7. Vérifier le rendu avant de livrer — obligatoire

Ouvrir les images `p1.png`, `p2.png`… et regarder : pagination juste, aucun texte coupé, cases
de paraphe visibles sur les pages intermédiaires et absentes de la page de signature, bloc
signatures assez haut, logo net, nom du salarié identique partout, aucun texte de gabarit
resté (« PRÉNOM NOM », « RAISON SOCIALE », « … », crochets). Puis passer la **liste de
relecture** de `references/controles.md` (section D).

« J'ai écrit le document » n'est pas « j'ai vu le rendu ». On ne livre pas sans avoir regardé.

### 8. Livrer

- **PDF + DOCX** : le PDF pour signer, le Word pour que le client ajuste un détail.
- Un message au client **factuel et court**, sans formule d'enthousiasme (« bonne nouvelle »,
  « super », « n'hésitez pas » sont interdits) :
  - ce qui a été **corrigé** par rapport à son brouillon, et pourquoi (une ligne par point,
    avec le texte de loi quand ça aide à comprendre) ;
  - ce qu'il doit **faire avant la signature** : DPAE, vérification préfecture s'il y a lieu,
    lettre du salarié s'il y a lieu, mutuelle/prévoyance ;
  - qui signe quoi, en combien d'exemplaires, et ce qui reste à compléter à la main ;
  - **s'il n'y avait pas de logo** : la phrase qui le demande (`references/logo-et-charte.md`,
    section 4).
- **Ne jamais apposer le cachet ni la signature du client**, ni sur le PDF ni sur le Word :
  c'est lui qui signe. On ne signe pas à la place de quelqu'un.

## Ce qu'on ne fait jamais

- Écrire « le cas échéant », « si applicable », un crochet vide, ou une donnée « probable ».
- Citer un minimum, un taux, une durée de mémoire : on l'a lu dans la CCN ou le Code, et on
  sait où.
- Livrer un temps partiel sans répartition des horaires, un CDD sans motif précis, un contrat
  d'étranger sans titre vérifié.
- Mettre un logo d'employeur sur une lettre du salarié.
- Livrer sans avoir regardé les pages rendues.
