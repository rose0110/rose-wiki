---
name: capsules-live
description: >
  Extraire des capsules vidéo sous-titrées karaoké (prêtes pour LinkedIn) depuis un
  replay de live ou n'importe quelle vidéo longue de Rose : repérage des passages
  forts, découpe aux bornes exactes, habillage « accroche d'abord » (style A plein
  cadre par défaut depuis le 07/10/2026, B fond blanc, C noir ; turquoise
  pour Daniel), carré et vertical, sous-titres karaoké relus à la main,
  vérification obligatoire. À utiliser dès que Rose parle de « capsule(s) »,
  d'« extrait » ou de « montage » d'un live/replay/webinaire, demande de « découper »
  ou « sous-titrer » une vidéo, dépose un .mp4 (+ .vtt) d'un live, veut un extrait
  pour LinkedIn/réseaux, ou veut offrir des capsules à un invité — même si elle ne
  prononce pas le mot « capsule ». Le pipeline complet (scripts inclus) est ici :
  ne pas le réinventer.
compatibility: Windows. Requiert ffmpeg (winget Gyan.FFmpeg ou PATH), Python avec faster_whisper et Pillow.
---

# Capsules vidéo depuis un live

Transformer un replay (souvent 1 h à 1 h 30) en capsules courtes carrées, habillées
et sous-titrées karaoké. Le process a été validé par Rose sur 4 lives (~60 capsules)
en juillet 2026. Les scripts font le travail mécanique ; le jugement du modèle porte
sur 3 choses seulement : **choisir les passages**, **attribuer les voix**, **relire
les sous-titres**. Tout le reste est scripté — suivre les étapes dans l'ordre.

## OÙ TOURNE LE MONTAGE : SUR LE VPS, PAS SUR LE PC DE ROSE (décision du 09/10/2026)

Rose : « les montages vidéo que tu fais sur mon ordinateur, ça prend beaucoup d'espace » (et règle 28
du CLAUDE.md global : le lourd part sur le VPS). Le disque du PC est régulièrement saturé (0,2 Go
libre le 08/10 : la transcription Whisper a planté, un rendu ffmpeg aussi).

- **Atelier** : `ssh codex-vps` → `~/capsules/` = `skill/` (copie de ce skill), `venv/`
  (faster-whisper 1.2.1, Pillow, numpy), `sources/` (lives, noms courts), `travail/<chantier>/`
  (jobs, mots, rendus intermédiaires), `livraison/`. Police Rubik dans `~/.local/share/fonts`.
  8 cœurs, ~19 Go de RAM dispo, ~80 Go de disque libre (disque partagé avec la CI et des projets :
  `nice -n 10` sur tout, purger `travail/` en fin de chantier).
- **Envoyer une source** : `bash <skill>/scripts/envoyer_vps.sh "nom.mp4|chemin local"` (reprise
  automatique : la connexion du PC coupe parfois en plein transfert). Ne PAS lancer plusieurs `scp` en
  boucle simple : un échec laisse un fichier tronqué et passe au suivant.
- **Aligner** : un script Python dans `travail/<chantier>/` lancé en `nohup nice -n 10 … < /dev/null &`
  (sans `< /dev/null`, la session ssh reste accrochée). Import de faster_whisper instantané sur le VPS.
- **Fabriquer** : `nice -n 10 ../../venv/bin/python ../../skill/scripts/make_capsule_accroche.py job.json A carre`
  (le script trouve seul police, logo et dossier du skill sur les deux machines). Mesuré le 09/10 :
  20 s sur le VPS contre 1 min 37 sur le PC, image identique.
- **Ramener** sur le PC UNIQUEMENT les `.mp4` finaux (quelques Mo) → dossier du live. Les fichiers
  intermédiaires, les wav, les planches de contrôle restent sur le VPS.
- Après toute modification d'un script du skill sur le PC, recopier `scripts/` sur le VPS
  (`tar -cf - scripts | ssh codex-vps 'tar -xf - -C ~/capsules/skill'`).
- Le VPS n'est PAS un lieu de stockage durable (non sauvegardé, disque à 80 %) : les sources
  y vivent le temps du chantier ; l'archive des vidéos va sur OneDrive.

`<skill>` désigne le dossier de ce skill ; tous les scripts sont dans `<skill>/scripts/`.

## Étape 0 — Questions à poser à Rose AVANT de commencer

Poser ces questions en une fois (puis ne plus s'arrêter que pour ses actions) :
1. **Format** : carré 1080×1080 (validé, défaut) ou vertical 9:16 (expérimental —
   si choisi, faire valider une frame de la première capsule avant de monter le reste).
2. **CTA** : sans (défaut — Rose adapte ses CTA à l'objectif du moment) ou avec
   bandeau (`cta1`).
3. Si le live est un duo : extraire aussi les passages de l'invité (avec son preset) ?

Ne PAS demander : les choix techniques (crops, bornes fines, découpage des cues) —
les faire, montrer le résultat.

## Étape 1 — Sonder la vidéo

```
ffprobe -v error -show_entries format=duration -of csv=p=0 "live.mp4"
ffmpeg -ss 300 -i "live.mp4" -frames:v 1 -y f300.png    (répéter à ~5 moments)
```
Regarder les frames : repérer les mises en page (côte à côte, partage d'écran,
vignettes) et leurs plages horaires, puis définir un crop 16:9 par personne et par
mise en page. **Tester chaque crop sur une frame et la regarder** avant d'aller plus
loin. Règles détaillées : lire `references/reperage.md` (section mises en page).

## Étape 2 — Lire le live EN ENTIER

- Avec un `.vtt` : `python <skill>/scripts/vtt_dump.py live.vtt --minutes > texte.txt`
- Sans transcription : `python <skill>/scripts/transcribe.py live.mp4 --out texte.txt`
  (lancer en arrière-plan, ~15-30 min pour 1 h 30)

Lire le texte intégralement (pas en diagonale : les pépites sont souvent au milieu
d'une réponse à une question). Si duo sans locuteurs marqués, attribuer les voix à
la lecture — cf. `references/reperage.md`.

## Étape 3 — Repérage + VÉRIFICATION DES FAITS → PROPOSER À ROSE

Construire la liste des capsules candidates en appliquant `references/reperage.md`
(à lire avant de trancher). Pour chaque candidate : titre de travail, bornes
approximatives, durée, punchline, thème, locuteur.

**Garde-fou obligatoire — vérifier les faits AVANT de proposer.** Une capsule
publiée amplifie ce qui est dit : le locuteur peut se tromper en direct, et une
erreur factuelle en capsule abîme sa crédibilité. Donc, pour chaque candidate,
relire les affirmations et les classer :
- **Fait vérifiable** (taux, plafond, règle de paie/droit, date, fonctionnement
  d'un outil, chiffre) → le vérifier réellement. Paie/droit/fiscal : sources
  officielles (BOSS, URSSAF, Légifrance, service-public.fr) via recherche web si
  disponible — jamais de mémoire seule sur un chiffre. Tech/IA : documentation à
  jour de l'outil.
- **Opinion ou estimation assumée** (« je pense que », « à mon avis », « près
  de 50 % je pense ») → OK telle quelle, c'est un point de vue affiché.
- **Anecdote personnelle** → OK, c'est son vécu.

Si une affirmation vérifiable est **fausse ou douteuse** : ne PAS la monter en
l'état. Soit resserrer les bornes pour exclure la phrase fautive, soit écarter
l'extrait — et dans les deux cas le **signaler à Rose avec la source** (elle peut
vouloir publier un correctif ou en reparler au live suivant). Dans la liste
proposée, indiquer pour chaque candidate le verdict du contrôle des faits
(✔ vérifié / opinion assumée / ⚠ point douteux + source).

**Présenter cette liste à Rose et attendre sa validation avant de monter** — c'est
le seul point d'arrêt du pipeline. Exception : si Rose a dit « fonce », « le
maximum », « chantier » ou équivalent, enchaîner directement — mais la
vérification des faits reste obligatoire même dans ce mode, et tout ⚠ est
signalé dans le compte rendu final.

## Étape 4 — Aligner les fenêtres retenues

```
python <skill>/scripts/align_words.py "live.mp4" --fenetres fenetres.json
```
`fenetres.json` : `{"slug": [début−3, fin+3], ...}`. Lancer en arrière-plan et
commencer l'étape 5 au fur et à mesure que les `words_<slug>.txt` sortent.

⚠ PIÈGE (vécu 31/07/2026) : sur le PC de Rose, l'import de ctranslate2/faster_whisper
peut prendre 5 à 15 min de wall-clock (scan antivirus des grosses DLL — 0,4 s de CPU
pour 4 min 36 de réel). Le processus N'EST PAS planté : NE PAS le tuer, il about it.
Conséquences pratiques :
- UN SEUL processus python pour TOUTES les fenêtres (tous lives confondus), pour ne
  payer l'import qu'une fois — regrouper les fenêtres de plusieurs vidéos dans un
  script consolidé plutôt que 4 invocations séparées.
- Passer `cpu_threads=8` à WhisperModel (défaut 4 threads, la machine a 20 cœurs).
- Juger « planté » seulement après ~20 min SANS nouveau `words_*.txt` ni wav temporaire.

## Étape 5 — Bornes exactes et sous-titres (le travail de fond)

Pour chaque capsule, lire `words_<slug>.txt` et :
1. Poser les bornes exactes des segments (début de phrase −0,1 s, fin de dernier
   mot +0,2-0,4 s ; segments multiples pour sauter un aparté/écho/prénom).
2. Écrire les cues karaoké À LA MAIN dans un petit script Python — règles, pièges
   Whisper et exemple : lire `references/sous-titres.md` (obligatoire, c'est là que
   se joue la qualité) :

```python
import sys; sys.path.insert(0, r"<skill>/scripts")
from ass_karaoke import build
build(r"<skill>/presets/rose.json", {
    "capsule_exemple": [
        (0.08, 3.04, "Première cue sur deux lignes|avec un mot *accentué*."),
    ],
}, fmt="carre")
```

## Étape 6 — Fabriquer

Un `job_<slug>.json` par capsule (schéma complet en tête de `make_capsule.py` :
source, preset, format, titre, crop, segments, cta1, badge_fix), puis :
```
python <skill>/scripts/make_capsule.py job_<slug>.json
```
Le fond et le badge sont générés automatiquement depuis le preset. Titres de fond :
courts, avec la punchline (« Mon premier logiciel de paie ? Poubelle. »).

### Gabarit par défaut : « accroche d'abord », style A (choisi par Rose le 07/10/2026)
Rose a refusé le marine/or (« trop déjà vu, ça fait IA ») et les capsules qui ne retiennent pas.
Pour SES capsules, utiliser `scripts/make_capsule_accroche.py` (schéma du job en tête du script) :
- ouverture directe sur la punchline (segments dans l'ordre du récit, pas forcément chronologique) ;
- accroche en grand en haut (2 lignes carré, 3 lignes vertical, `*mot*` = mot mis en valeur) ;
- **style A par défaut** : plein cadre (la vidéo fait le fond), accroche en étiquettes blanches, police Rubik,
  sous-titres blancs contour noir, mot clé en jaune ; en vertical, vidéo 6:5 sur fond NOIR uni ;
  styles **B** (fond blanc + surligneur) et **C** (noir + corail) disponibles : `make_capsule_accroche.py job.json B vertical` ;
- **fond flouté REFUSÉ par Rose (08/10/2026)** : « ça ne rend pas bien ; l'image que j'ai au fond, c'est mieux ».
  Tous les fonds sont désormais NOIR uni (A vertical et A16).
- **Petite caméra (vignette 232×130 ou 246×138 en partage d'écran) → style `A16`** : caméra entière 16:9 sur fond
  noir uni, accroche au-dessus, sous-titres dessous (agrandissement ×4,6, celui de l'ancien format ; un plein cadre
  grossirait ×8 = flou). Utilisé le 10/10/2026 pour les « meilleurs conseils IA » (`capsules-live/conseils-ia/`).
  Avant de conclure qu'une caméra est petite, chercher un enregistrement séparé de la webcam (StreamYard en produit) —
  et l'ouvrir : celui des Fondamentaux est entièrement noir ;
- **Caméra de téléphone en portrait (tuile 9:16, ex. 608×1080 le 08/10/2026) → vertical en style `AP`** : la vidéo
  remplit tout l'écran 1080×1920, accroche en haut, sous-titres au-dessus du bandeau « Lien en bio » ; carré en
  style `A` avec `"crop_map_carre": {"CAM": "608:608:x:150"}`. Mesurer la tuile sur 2-3 images : elle change de
  place quand un autre participant (ou un enregistreur type Fathom) entre dans la mosaïque ;
  **téléphone tenu à la main → toujours stabiliser** (Rose, 10/10 : « l'écran bougeait un peu ») :
  `"stabiliser": {"CAM": "<tuile entière w:h:x:y>"}` dans le job (vid.stab 2 passes, lissage 30, léger zoom fixe).
  Mesuré le 10/10 sur « DSN yeux fermés » : mouvement image à image −28 % (carré) et −38 % (vertical), cadrage quasi
  identique. Mesure : `vidstabdetect` + `vidstabtransform:debug=1` sur la zone vidéo (pas une corrélation sur l'image
  entière : les étiquettes et sous-titres fixes faussent la mesure). Lissage 80 n'apporte rien de plus ;
- **live participatif = voix superposées** : lire le VTT (locuteurs nommés) autour de chaque coupe ; un « oui »,
  « exactement », « merci » d'un participant pendant que Rose parle se retrouve dans la capsule. Couper avant,
  ou renoncer à la phrase (le 08/10 : fin du fait générateur retirée pour cette raison) ;
- anciennes capsules (juillet) : on ne les refait PAS en bloc (Rose, 08/10) ; seulement une sélection qu'elle demande
  (ex. les meilleurs conseils IA, 09/10) ;
- recadrages propres à un live : `"crop_map"` dans le job (tous formats), ou `"crop_map_carre"` /
  `"crop_map_vertical"` (un carré 940×940 et un 6:5 1128×940 centrés sur le visage ne partent pas du même x) ;
  vérifier le visage sur 4-5 images réparties dans le passage (le 16/07, Rose était décalée de 80 px) ;
- vertical = bandeau « Lien en bio » obligatoire (décision 31/07), tout l'utile entre y=150 et y=1490 ;
- sous-titres recalés automatiquement sur la durée réelle des segments ; 1re image toujours avec le visage.
Référence : `Downloads/capsules-live/test-accroche/` (capsule « prix à perte », live du 01/10/2026).
`make_capsule.py` + `rose.json` restent pour les invités et l'historique, plus pour les nouvelles capsules de Rose.

## Étape 7 — VÉRIFIER (obligatoire, jamais sauté)

1. `python <skill>/scripts/verify_borders.py *.mp4` → chaque DÉBUT commence sur un
   début de phrase, chaque FIN finit une phrase du bon locuteur. Un mot rogné ou une
   voix parasite ⇒ corriger la borne, refabriquer, revérifier.
2. Frames de contrôle (1 frame mi-capsule par fichier, assemblées en planches 2×2
   avec hstack/vstack) : cadrage, badge, karaoké, rien de sensible dans le champ.
3. Annoncer honnêtement à Rose ce qui a été vérifié (bornes retranscrites, frames)
   et ce qui ne l'a pas été (visionnage intégral) — son visionnage de validation
   reste nécessaire avant publication.

## Étape 8 — Livrer et documenter

- Nommage : `capsule_<slug>.mp4` (Rose) / `<prénom-invité>_<slug>.mp4` (invité).
- Destination par défaut (décision Rose du 08/10/2026) : `C:\Users\roses\Downloads\capsules-live\`,
  **UN dossier par live, à plat, nommé d'après le sujet du live** (ex. `freelance-paie/`
  pour le live Q/R du 01/10) — toutes les capsules du live dedans, carré et vertical
  côte à côte, PAS de sous-dossiers thématiques (« ne pas mélanger ça dans plein de
  sous-dossiers »). Une capsule à faire valider garde le préfixe `A-VALIDER_` dans le
  même dossier. Recettes (jobs, scripts, planches) hors du dossier livré :
  `gabarit/recettes-<sujet>/`. `cadeau-<invité>/` pour un invité. Jamais en vrac.
  (L'ancien rangement `capsules/{paie, ia-convictions, …}` reste tel quel pour les anciennes.)
- Mettre à jour `REPERAGE.md` du dossier de destination : bornes exactes par capsule,
  écartés (et pourquoi), réserves ; et la mémoire persistante du projet si elle existe.

## Gabarits (presets) — la partie modulable

Les presets JSON dans `<skill>/presets/` portent toute l'identité visuelle :
couleurs (fond dégradé, accent, sous-titres), polices et alignement du titre,
kicker, badge (texte, position), fps. **Le process ne change jamais ; seule cette
mise en page se personnalise.**
- `rose.json` — ancien gabarit de Rose (marine/or, 17/07/2026) : remplacé le 05/10/2026 par
  `make_capsule_accroche.py` style A pour ses nouvelles capsules (cf. étape 6).
- `daniel.json` — gabarit cadeau de Daniel CLEMENTINE (modèle pour tout invité).
- Nouvelle identité = copier un preset, changer couleurs/polices/badge/kicker,
  générer un fond d'essai (`make_fond.py --preset ... --titre "Essai" --out t.png`),
  le montrer à Rose avant de monter.

Constantes non négociables sans son accord explicite : recadrage sur la caméra
seule, sous-titres karaoké (jamais statiques), coupes nettes, capsules neutres sans
CTA par défaut, vérification de l'étape 7.
