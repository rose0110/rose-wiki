---
name: telerc
description: Saisir une demande d'homologation de rupture conventionnelle sur TéléRC (telerc.travail.gouv.fr) à la place de Rose, à partir du Cerfa 14598 rempli ou des pièces du dossier — contrôle des pièces, calendrier, salaires, indemnité, saisie étape par étape dans le navigateur intégré, enregistrement du brouillon, jamais de transmission sans son go. À utiliser dès que Rose dit « saisis sur TéléRC », « fais la rupture conventionnelle », « remplis la demande d'homologation », dépose un Cerfa 14598 ou un dossier de rupture conventionnelle, ou demande « à quelle date au plus tôt » pour une rupture conventionnelle. Procédure vivante, conçue pour être rejouée par un RPA et améliorée à chaque dossier.
---

# TéléRC — saisie d'une rupture conventionnelle

Procédure rodée le 12/10/2026 sur le dossier ELEVATION INDOOR / Killian ARSIC (demande 202610528343P).
**Elle s'améliore à chaque dossier** : en fin de saisie, ajouter au « Journal des dossiers » ce qui a coincé.

## 0. Règles d'arrêt (non négociables)

- **Ne jamais passer à l'étape suivante s'il manque une information obligatoire** de l'étape en cours
  (consigne de Rose du 12/10/2026). On remplit tout ce qu'on a, on **enregistre**, on s'arrête et on liste ce qui manque.
- **Jamais « Transmettre »** sans le go explicite de Rose, et jamais avant le lendemain de la fin du délai de rétractation
  (un dépôt anticipé est refusé).
- Ne jamais inventer une donnée : un champ vide dans les pièces reste vide et se demande (courriel du salarié,
  effectif, montant de l'indemnité convenu…).
- Le montant de l'indemnité est un **accord entre les parties** : on calcule le plancher, on ne le choisit pas.
- Rose est connectée elle-même (courriel + n° de demande + mot de passe) : ne jamais saisir son mot de passe.

## 1. Avant d'ouvrir TéléRC : contrôler le dossier

Pièces attendues : Cerfa 14598 rempli (souvent en PDF), demande écrite, compte rendu d'entretien, bulletins des 12 derniers mois.

Lecture du PDF : l'extraction de texte brouille les chiffres en cases → **toujours rendre les pages en image**
(`python -I -c "import fitz; ..."` → `get_pixmap(dpi=110)`) et lire l'image. Le 12/10/2026, l'extraction texte a donné
« 75.3602 » pour une moyenne qui valait 2 063,57 € sur l'image.

Contrôles :
1. **Ancienneté à la date envisagée de rupture** (pas à la signature) : années + **mois complets seulement — les jours
   ne comptent pas** (art. R. 1234-1 : année incomplète au prorata des mois complets). Correction de Rose du 12/10/2026 :
   j'avais compté 7 ans et 3 jours (3 615,48 €) au lieu de 7 ans 0 mois (3 611,25 €).
2. **Salaire de référence** = la plus élevée des moyennes 12 mois / 3 mois (primes des 3 mois au prorata).
3. **Indemnité plancher** = max(légale, conventionnelle). Légale : 1/4 de mois par année jusqu'à 10 ans, 1/3 au-delà
   (art. R. 1234-2), années incomplètes au prorata. Conventionnelle : vérifier la CCN (ex. sport IDCC 2511 : 1/5 jusqu'à
   5 ans, 1/4 de 5 à 10 ans, 1/3 au-delà — moins favorable que la loi jusqu'à 10 ans ; source Legisocial, texte
   officiel à relire).
4. **Calendrier** (source : service-public.gouv.fr F19030) :
   - aucun délai imposé entre entretien et signature ;
   - rétractation : 15 jours calendaires à partir du lendemain de la signature ; dernier jour samedi/dimanche/férié → reporté ;
   - dépôt : au plus tôt le lendemain de la fin de rétractation ;
   - instruction : 15 jours ouvrables (lundi→samedi, hors fériés) à partir du lendemain de la réception ;
     échéance non ouvrable → reportée ;
   - rupture : au plus tôt le lendemain de l'homologation.
   Calculer avec un script (jour de semaine réel), jamais de tête. Penser aux fériés (1er et 11 novembre, etc.).

## 2. Saisie — navigateur intégré, URL https://www.telerc.travail.gouv.fr/

Accueil : « Créer une nouvelle demande » ou « Compléter une demande existante » (Rose se connecte).
Barre de gauche : Employeur · Salarié(e) · Calcul de l'indemnité · Calendrier · Validation · **Enregistrer**.
Une coche ✓ = étape complète, ✗ = incomplète. « Saisie autorisée jusqu'au … » : brouillon effacé passé 15 jours.

**Ne JAMAIS recharger la page ni naviguer par URL directe** vers une étape : la session TéléRC est gardée en
mémoire de la page, une URL tapée ou un rechargement affiche une page blanche et **déconnecte** (14/10/2026 :
rechargement pour vérifier → Rose a dû se reconnecter). Pour vérifier un enregistrement : quitter par
« Retour vers la page d'accueil », puis « Compléter une demande existante » (Rose saisit son mot de passe).
Les références d'éléments changent après chaque changement d'étape : refaire `find` avant de cliquer (un ancien
`ref` du bouton Enregistrer a ouvert un autre onglet).
La session expire après quelques heures : Rose doit se reconnecter (je pré-remplis courriel + n° de demande,
jamais le mot de passe).

Les champs sont des composants Angular Material : cliquer puis taper (pas d'injection de valeur en JS).
Relire les valeurs avec :
`[...document.querySelectorAll('main input')].map(e=>[e.getAttribute('formcontrolname')||e.id,e.value])`

### Étape Employeur (`formcontrolname`)
| Champ | Source | Remarque |
|---|---|---|
| Type d'identifiant | SIRET | radio par défaut |
| `siret` | Cerfa | **taper le SIRET puis Tab : raison sociale, APE ET adresse se préremplissent** |
| `raisonSociale`, `ape` | auto | vérifier |
| `effectif` | à demander | non obligatoire |
| `nomSignataire` | Cerfa | « Prénom NOM, Qualité » |
| `courriel` * | Cerfa | obligatoire |
| `telephone` | Cerfa | |
| Adresse (`query`) | auto | **ne rien taper si déjà préremplie** (sinon doublon) ; sinon taper et choisir dans la liste |

### Étape Salarié(e)
| Champ | Remarque |
|---|---|
| Civilité | cliquer le **libellé** « Monsieur »/« Madame » |
| `nom`, `prenom` | |
| Date de naissance | format jj/mm/aaaa puis Tab |
| Pays | liste → France, puis le champ adresse apparaît : taper l'adresse et **choisir la suggestion** |
| `courriel` * | **obligatoire** — absent du Cerfa papier : à demander au client |
| `telephone` | facultatif |
| Qualification * | radio (cadre dirigeant / autre cadre / technicien-agent de maîtrise / employé / ouvrier) — reprendre la case du Cerfa |
| `emploi` | |
| `conventionCollective` | taper l'IDCC (ex. 2511) et choisir la suggestion |

### Étape Calcul de l'indemnité
1. Ancienneté : années et mois (champs numériques ; triple-clic puis taper).
2. Dernier mois rémunéré : mois + année (listes) → bouton « Passer à l'étape de la rémunération ».
3. Rémunération : choisir **« Évolutive sur les 12 derniers mois »** dès qu'un mois diffère (sinon un seul champ).
   12 champs libellés « Octobre 2025 » … « Septembre 2026 » : saisir avec un **point décimal** (2017.66).
   « Dont primes » des 3 derniers mois.
4. Bouton « Passer à l'étape de la rémunération » (le 2e) → apparaissent :
   - **Rémunération mensuelle brute moyenne** * : saisir la plus élevée des moyennes (TéléRC affiche « Résultat du
     calcul automatique (moyenne) » : contrôler qu'il est égal au nôtre) ;
   - **Indemnité proposée** * : montant convenu entre les parties, jamais en dessous du minimum légal affiché par
     TéléRC (années + mois complets ; 12/10/2026 : 3 611,25 €) ni du minimum conventionnel. Notre calcul doit tomber
     sur le même minimum que TéléRC : sinon, chercher l'écart avant de saisir ;
   - Indemnité conventionnelle (facultatif), Commentaires (facultatif).

   - **Piège : après « Enregistrer », la partie indemnité est verrouillée** (champ désactivé, la frappe ne fait rien).
     Pour la modifier : 2e bouton « Modifier l'étape précédente » → « Passer à l'étape de la rémunération » → le champ
     redevient modifiable ; clic, Ctrl+A, Retour arrière, taper, Tab, puis vérifier le montant en lettres affiché.

### Étape Calendrier
- Entretien n° 1 : date (jj/mm/aaaa + Tab), « Salarié assisté » et « Employeur assisté » : cliquer le libellé Oui/Non.
  « Ajouter entretien » s'il y en a eu plusieurs.
- « Le formulaire est signé par les parties le… » * : date de signature + Tab → **TéléRC calcule et affiche** la fin de
  rétractation, la date de dépôt possible et la rupture au plus tôt. **Comparer avec notre calcul** : s'ils diffèrent, s'arrêter.
- « Date envisagée de la rupture » * : au plus tôt la date affichée par TéléRC.
- Remarques complémentaires, Autres clauses : facultatifs.

### Étape Validation
- « Imprimer ma demande en mode brouillon » : sans risque, enregistre et produit un PDF de travail.
- « Valider et imprimer le formulaire » : **IRRÉVERSIBLE** (plus aucune modification possible) et impossible tant
  qu'un onglet est en ✗. **Jamais sans le go explicite de Rose.**
- La transmission se fait ensuite depuis l'accueil (« Transmettre une demande existante »), au plus tôt le lendemain
  de la fin de rétractation.

## 3. Fin de session

1. Cliquer **Enregistrer** et vérifier le bandeau « Enregistrement réalisé avec succès ».
2. Rendre compte à Rose : étapes complètes, **liste des informations manquantes** (une ligne chacune), date limite de saisie.
3. Ajouter une ligne au journal ci-dessous (ce qui a coincé, ce qui a changé sur le site).

## 4. Signature électronique du Cerfa validé (Paraf)

Le PDF généré par « Valider et imprimer » contient **3 exemplaires** de 2 pages : n'en garder qu'un (pages 1-2).
Créer la demande Paraf avec `--draw-only` (signature tracée imposée — demandé par Rose ; l'option ne s'ajoute
qu'à la création) et **sans paraphe**. Champs posés à la main en page 2, dans le cadre « Date et signature » :
employeur date x8/y43 + signature x27/y43, salarié date x51/y43 + signature x70/y43 (en %). La date se remplit
au moment de la signature. Vérifier que la date de signature attendue par le Cerfa (fin de rétractation imprimée
− 15 jours) est tenable : sinon les dates imprimées deviennent fausses. Adresse de l'employeur : la chercher
dans les e-mails du dossier (Outlook), pas la deviner.

**Contrôle de l'e-mail du salarié AVANT validation** (15/10/2026) : l'adresse transmise par le client était
fausse (kiliannoah74 au lieu de killiannoah74) ; le lien Paraf est parti dans le vide et TéléRC + Paraf ont dû
être refaits (Paraf ne permet pas de corriger l'e-mail d'un signataire). Faire confirmer l'adresse par écrit
si elle diffère de l'orthographe du nom.
Création d'une nouvelle demande : captcha → Rose le saisit ; ensuite je remplis tout.

## Journal des dossiers

- **12/10/2026 — ELEVATION INDOOR / Killian ARSIC (n° 202610528343P)**. Employeur complet ; Salarié complet sauf
  courriel du salarié (obligatoire, absent du Cerfa) ; ancienneté 7 ans 0 mois, dernier mois 09/2026, 12 salaires saisis
  (moyenne 12 mois 2 063,57 €). Arrêt avant le montant de l'indemnité (non convenu dans le Cerfa). Leçons : le SIRET
  préremplit aussi l'adresse ; l'extraction texte du PDF est fausse sur les cases, lire l'image ; Rose : ne pas passer
  à l'étape suivante s'il manque des informations.
  Suite le même jour, sur instruction de Rose (« remplis tout le reste ») : primes 0, moyenne 2 063,57 € (= calcul
  automatique TéléRC), indemnité d'abord saisie à 3 615,48 € (jours comptés à tort), corrigée sur remarque de Rose à
  3 611,25 € (7 ans 0 mois, = minimum TéléRC),
  entretien 28/08/2026 sans assistance, signature 13/10/2026 → TéléRC : rétractation jusqu'au 28/10, dépôt dès le
  29/10, rupture au plus tôt le 18/11/2026 (identique à notre calcul). Tout enregistré ; seul manque le courriel du
  salarié. Non validé, non transmis.
