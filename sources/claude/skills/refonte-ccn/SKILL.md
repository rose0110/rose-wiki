---
name: refonte-ccn
description: Procédure complète pour fiabiliser le CONTENU de fiches / synthèses de conventions collectives (CCN) — fidélité au texte source, nettoyage des restes techniques, tableaux, intitulés, vérification juriste, une seule mise en ligne, preuve en ligne. Rodée sur CCN OpenPaye (30/09-01/10/2026, 368 fiches, ~1 000 corrections). À charger dès que Rose veut « refondre », « fiabiliser », « relire », « corriger » ou « vérifier la véracité » des conventions collectives d'un projet (CCN OpenPaye, SmartDataPay — synthèses de l'Assistant Conventions Collectives, DataPaie, HUP-RH…), quelle que soit la mise en page. Ne concerne PAS la présentation : seulement le contenu et sa justesse.
---

# Refonte du contenu des conventions collectives

Procédure tirée du chantier CCN OpenPaye (dépôt `C:\Users\roses\.codex\worktrees\5549\CCN OPENPAYE`, outils
dans `scripts/qualite/`, journal dans `PROJECT-HANDOFF.md` et `CHANTIERS.md`). La mise en page des autres projets
diffère ; la démarche, les règles et les contrôles sont les mêmes. Adapter les scripts au format de données du
projet (ils sont courts) plutôt que de les réécrire de zéro.

## 0. Les règles de fond (non négociables)

1. **On reproduit le texte de la convention, on n'interprète pas.** Décision Rose du 01/10/2026 : « ce n'est pas à
   nous de décider, on récupère le texte c'est tout ». Jamais de rappel de la loi, de comparaison « la loi est plus
   favorable », d'avis sur une clause, de calcul ou de conversion. Une clause ancienne moins favorable que la loi
   reste écrite telle quelle. (Erreur vécue : 114 lignes « loi du 22-4-2024 » ajoutées puis retirées le jour même.)
2. **Source de vérité = le texte de l'éditeur (ELENET) de chaque convention.** Toute valeur écrite doit s'y
   retrouver. Ce qu'aucune source ne dit, on ne l'écrit pas.
3. **Hors périmètre maison** : on n'AJOUTE jamais de rubrique sur les congés pour événements familiaux, les
   indemnités de rupture (et leur base de calcul) ni les salaires minima ; on ne SUPPRIME pas non plus une mention
   exacte déjà publiée sur ces sujets.
4. **Un avenant récent remplace l'ancien** ; la mention « non étendu » reste toujours écrite. Pour une convention
   territoriale remplacée (métallurgie), une absence ne vaut que pour « les dispositions territoriales maintenues ».
5. **Aucun jargon visible** : pas de « synthèse », « source », « JSON », « non spécifié », « PNUM », champ brut
   (`{'debut': …}`, `None`, `['…']`), étiquette interne (`[GÉNÉRAL]`), renvoi « voir n° X » vers la numérotation
   de l'éditeur.
6. **Une seule mise en ligne par campagne** (règle n° 26) : toutes les corrections connues d'abord, puis UN go.
7. **Rose ne relit pas le contenu** : la justesse repose sur ce processus (modèle + juriste + contrôles), et le
   compte rendu dit exactement ce qui a été vérifié et ce qui ne l'a pas été.

## Modèles d'IA, accès et coûts (mesurés sur CCN OpenPaye)

| Étape | Modèle | Comment | Coût mesuré |
|---|---|---|---|
| Relecture fiche contre source, propositions de réécriture | **Claude Sonnet 5.5** (`anthropic/claude-sonnet-5.5`) | API OpenRouter, clé dans `~/.secrets/openrouter.env` (lue par `cle_openrouter()`), température 0, plafond de dépense par lancement (`--plafond`) | relecture 368 fiches 38,73 $ ; passages 29,20 $ + 7,91 $ ; blocs 5,19 $ — ≈ 81 $ la campagne |
| Second avis (verdicts) | **agents `juriste-paie`** de Claude Code (modèle de la session, Opus) | lancés en parallèle, un dossier chacun, en arrière-plan | compris dans l'abonnement Claude Code |
| Tri « cette sous-partie a-t-elle sa place dans cette rubrique ? » (avant la relecture, 28/09) | **Jev** (`typesafe/jev-1.13`, OpenRouter) + double avis **GPT-5 mini**, puis Sonnet sur les cas retenus | `scripts/resynthese/controle_jev.py` : 327 sous-parties hors sujet retirées, 22 rubriques rendues à leur version antérieure | faible |
| Application, nettoyage, contrôles | aucun modèle | scripts Python à règles fixes, tests | 0 |

- Les textes des conventions sont publics : l'envoi à OpenRouter est admis (décision Rose, déjà appliquée dans
  SmartDataPay pour le tri des phrases). Aucune donnée de salarié ou de client ne part vers un modèle.
- **Jev : bon pour trier, pas pour juger.** Utile pour repérer une sous-partie rangée dans la mauvaise rubrique,
  avec un second avis. Mesuré NON fiable comme juge de fidélité d'un texte (SmartDataPay, résumés d'actualités,
  26/09/2026) : ne jamais lui confier le verdict « exact / inexact » ni les nombres.
- La gate finale de justesse reste sur un modèle fort (skill `routage`) : jamais un modèle léger pour les verdicts.
- Budget : annoncer l'estimation à Rose avant le premier lancement, mesurer sur 20 fiches, puis dérouler.

## 1. Inventaire honnête (avant toute correction)

- Compter avec **le moteur d'affichage réel de l'application** (pas seulement un audit à part) : tableaux
  incomplets, passages mal structurés, restes techniques. Un chiffre hérité d'un ancien rapport est souvent périmé
  (vécu : « 64 tableaux » → 16 défauts réels).
- Recenser par motifs : champs bruts, « synthèse / source / document », « non spécifié », renvois numérotés,
  numéros de paragraphe, listes brutes, étiquettes internes, lignes « Sources : [ » tronquées.
- Contrôler l'**intitulé affiché** de chaque fiche contre l'« intitulé officiel » de la fiche et le titre du fichier
  source (vécu : 575 / 1266 / 1311 décalés entre eux).

## 2. Relecture complète contre la source (modèle fort)

- `relecture_tournante.py` : chaque fiche entière contre son texte source, constats typés (grave / moyen / mineur),
  RIEN n'est écrit. Coût mesuré : ~0,10 $ par fiche (Sonnet 5.5 via OpenRouter). Mesurer sur un lot de 20 avant le
  reste, dans le budget validé par Rose.
- `paquets_verification.py` : dossiers de ~40 constats pour le second avis.

## 3. Second avis juriste-paie (obligatoire avant toute écriture)

- Agents `juriste-paie` en parallèle, un dossier chacun, consigne écrite avec les règles du § 0. Verdict par
  constat : CONFIRMÉ / PARTIEL (texte final complet) / INFIRMÉ, au format JSON, + ce qui a été vérifié et ce qui ne
  l'a pas été + défauts repérés hors du lot (à recenser, ils nourrissent les reliquats).
- `extraire_verdict.py` lit le bloc JSON dans la transcription de l'agent (pas de recopie à la main).
- Un INFIRMÉ qui donne un texte de remplacement devient PARTIEL ; un PARTIEL sans texte = à traiter à la main.

## 4. Passages techniques (deux tours)

- `reecrire_passages.py` (motifs du tour 1, puis `--tour 2` pour les variantes trouvées après application) :
  le modèle propose des remplacements EXACTS (texte copié de la fiche, unique), `dossiers_passages.py` prépare les
  dossiers, juristes, `verdicts_passages.py` convertit.

## 5. Application en une fois, dans l'ordre

`appliquer_verdicts.py` (correspondance exacte et unique, limitée à la rubrique ; rubrique vidée = retirée ;
registre) : relecture → passages tour 1 → tour 2 → reliquats → passe finale `nettoyer_formulations.py --finale`
(règles fixes, testées : `scripts/qualite/tests/test_nettoyer_formulations.py`). Toujours repartir de la base de
la branche de production pour pouvoir rejouer toute la chaîne.

Pièges vécus :
- une règle par expression régulière sans ancre de fin a tronqué 11 lignes « Sources » → tester chaque règle sur
  des cas positifs ET négatifs avant de l'appliquer ;
- les heredocs bash abîment les échappements Python (`\b`) → écrire le code avec Write/Edit ;
- deux corrections sur le même passage (relecture puis passages) : la seconde ne trouve plus son texte →
  vérifier qu'il ne reste aucun résidu, ne pas forcer ; si le texte de remplacement est déjà là, « déjà appliqué » ;
- **l'extraction de l'éditeur peut omettre une règle réelle** (vécu : VRP, ANI du 3-10-1975 art. 7, vérifié sur
  Légifrance). Une SUPPRESSION motivée par « absent de la source » sur une règle plausible se vérifie sur KALI
  avant d'être appliquée (arbitrage écrit, sinon suspendue) ;
- toute valeur chiffrée nouvelle d'une correction doit exister dans la source (contrôle automatique) ; un doublon
  se juge dans le même passage seulement (deux passages peuvent porter le même tableau) ;
- sous Windows, Python écrit `/tmp` dans `C:/tmp` alors que bash a son propre `/tmp` : une liste de clés passée par
  `$(cat /tmp/…)` peut être vide → chemin absolu `C:/tmp/…` et contrôle du nombre de clés AVANT de lancer un lot
  payant (vécu : 2,61 $ perdus) ;
- un juriste peut écrire des guillemets droits non échappés dans son JSON : réparer à la récupération
  (`reparer_json.py`), jamais recopier à la main ;
- une commande longue coupée par un délai ne prouve rien : la relancer en arrière-plan et lire sa sortie.

## 6. Tableaux

- Un tableau réduit à ses intitulés : chercher d'abord s'il existe déjà en entier dans la même fiche (vécu : tous
  l'étaient) → renvoi « voir « titre exact » » ; sinon le recopier tel quel depuis le HTML source
  (`reconstruct_tables.load_source_tables`), en vérifiant le département / la période de chaque tableau.
- Une case sur plusieurs lignes casse le tableau : recoller avec `<br>` (et vérifier que l'affichage interprète
  `<br>` dans une case).
- **Cellules fusionnées (cause n° 1 des erreurs graves, SmartDataPay 01/10/2026)** : une cellule `rowspan` /
  `colspan` de la source (« 48 heures » du salarié sur trois lignes, « 100 % » des apprentis, départ à la retraite
  sur cinq catégories) n'est recopiée que sur sa première ligne. Toujours lire le HTML de la source, pas le texte.
  Réparation automatique prudente (`tableaux_fusionnes.py`) : on ne remplit qu'une case VIDE dont la colonne
  correspond sans ambiguïté ; une valeur différente est signalée, jamais remplacée.
- Un tableau à UNE colonne « délai de prévenance » qui mélange employeur et salarié : le remplacer par les deux
  colonnes de la source, sinon on cache le délai de l'employeur.
- Jamais retirer un en-tête seul : retirer une colonne = remplacer le tableau entier. `appliquer_verdicts.py`
  bloque toute correction qui rend un tableau déséquilibré (`tableaux_bancals`, largeur de ligne fusions comprises).

## 7. Contrôles avant la demande de go

- Chaîne du projet (dates de mise à jour, métadonnées), tous les tests, contrôle des types, build.
- Rendu avant / après avec le moteur d'affichage : aucune anomalie nouvelle.
- **Au navigateur**, sur quelques fiches touchées : la mise en forme de lecture peut transformer le texte (vécu :
  paragraphe long découpé en puces à chaque point).
- Tests anti-retour ajoutés pour chaque classe de défaut corrigée (jargon, intitulés, tableaux, aucune
  interprétation ajoutée).
- `PROJECT-HANDOFF.md` et `CHANTIERS.md` à jour (écrire en binaire si le fichier est en CRLF).

## 8. Mise en ligne et preuve

- UN go de Rose pour toute la campagne, puis la procédure du projet (Replit : Pull dans l'onglet Git + Republish,
  la fenêtre Edge doit rester au premier plan ; Vercel : skill `deploy-vercel-sur`).
- SmartDataPay : le contenu des synthèses part SANS go (décision du 25/09/2026), par le stockage :
  `scripts/ccn/refonte/publier-refonte.mjs` (essai à blanc par défaut, `--publier` pour écrire). Il refuse une
  synthèse si le fichier local diffère de origin/master, si la version servie a changé depuis la lecture, ou si la
  forme est invalide, et relit après dépôt. Partir de l'état réellement servi (`etat-servi.mjs`), jamais du seul
  fichier du dépôt.
- Preuve en ligne : TOUTES les fiches modifiées servies identiques à la base + dates conformes + santé ; une fiche
  vue à l'écran ; veille / surveillance mise à jour sur la nouvelle référence.

## 9. Ce qu'on ne fait pas

- Proposer des « points à trancher » qui sont des interprétations juridiques : ce n'est pas notre rôle.
- Mettre en ligne lot par lot.
- Annoncer « vérifié » sans dire quoi exactement.
