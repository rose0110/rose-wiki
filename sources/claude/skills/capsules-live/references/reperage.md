# Règles de repérage — quels passages deviennent des capsules

## Ce qui fait une bonne capsule
- **Un seul message** par capsule, autoportant : compréhensible sans avoir vu le live.
- Durée cible **25 s à 95 s** (au-delà de ~1:35, découper en deux capsules).
- Une **punchline ou image forte** (« la cerise sur le gâteau », « clic, clic, stabilo
  jaune », « des cimetières de projets ») vaut de l'or : c'est souvent elle qui donne
  le titre du fond.
- Les **anecdotes personnelles** (échec formateur, « ma fille l'a débranché ») marchent
  très bien : ne pas les lisser, elles font l'authenticité.
- **Ne pas sur-filtrer les redites** : le même message reformulé dans un autre live est
  une capsule valable (leçon donnée par Rose le 18/07/2026 — « 4 capsules seulement ? »).
  N'écarter que les doublons quasi mot pour mot d'une capsule déjà montée.

## Vérification des faits (garde-fou, jamais sauté)

Le locuteur parle en direct : il peut se tromper sur un taux, une règle, une date,
le fonctionnement d'un outil. Une capsule fige et amplifie l'erreur. Avant de
proposer un extrait :
1. Relever chaque **affirmation vérifiable** qu'il contient (chiffres, règles de
   paie/droit, dates, capacités d'un outil, noms de modèles).
2. La vérifier pour de vrai : paie/droit/fiscal → BOSS, URSSAF, Légifrance,
   service-public.fr (recherche web, pas de mémoire seule sur un chiffre) ;
   tech/IA → doc officielle à jour de l'outil.
3. Distinguer : un fait faux → on resserre les bornes pour l'exclure, ou on
   écarte l'extrait, et on **le signale à Rose avec la source**. Une opinion
   assumée (« je pense que… ») ou une anecdote personnelle → publiable telle
   quelle. Une approximation de vulgarisation volontaire (schématisation
   annoncée) → publiable si elle ne induit pas en erreur sur le fond.
4. Afficher le verdict dans la liste proposée à Rose (✔ / opinion / ⚠ + source).

En cas de doute non tranchable, le dire honnêtement à Rose plutôt que de monter :
mieux vaut une capsule de moins qu'une erreur publiée.

## Ce qu'on écarte systématiquement
- **Écrans sensibles** dans le champ recadré : SIRET, identifiants, données clients,
  mentions « RESTREINT », favoris/onglets du navigateur. (D'où le recadrage sur la
  caméra seule — mais vérifier les frames quand même.)
- **Concurrents nommés et critiqués** (éditeurs de logiciels, confrères) : risque
  réputationnel.
- **Dialogues centrés sur un participant nommé** (« Fatima », « Cécile »…) : soit on
  coupe le prénom au montage, soit on écarte. Une réponse générique dont on retire
  l'adresse nominative reste exploitable.
- **Passages promo** (e-book, offre) : Rose gère ses CTA elle-même — les capsules sont
  neutres par défaut, le CTA s'ajoute en paramètre (`cta1`) selon l'objectif du moment.
- Bafouillages longs, faux départs, incidents techniques (écho, micro) : couper le
  passage fautif via un **segment multiple** plutôt qu'écarter toute la capsule.

## Duo / invité
- Les VTT Teams portent parfois les locuteurs (`<v Nom>`), les exports LinkedIn souvent
  PAS : dans ce cas, attribution des voix **à la lecture** (qui dit « je te laisse la
  parole », qui raconte quelle anecdote). En cas de doute sur une frontière de voix,
  choisir des bornes bien à l'intérieur d'un passage clairement attribué.
- Les passages de l'invité peuvent devenir des capsules **avec SON gabarit** (preset
  distinct — cf. `presets/daniel.json` comme modèle) : Rose en fait des cadeaux.

## Bornes et coupes
- **Coupes nettes** : début au début d'une phrase, fin sur un silence, jamais en plein
  mot. Les bornes viennent des cues VTT puis sont affinées avec `words_<slug>.txt`
  (prendre le début du premier mot −0,1 s, la fin du dernier mot +0,2 à 0,4 s).
- Attention aux **interjections de l'autre voix** collées à la borne (« Exactement »,
  « Même en Europe ») : couper avant.
- Une capsule peut avoir **plusieurs segments** (on saute un aparté, un écho, un
  prénom) : la concaténation est gérée par `make_capsule.py`, et les temps des
  sous-titres sont relatifs au clip concaténé (additionner les durées des segments
  précédents).

- **Fins de mots : ne pas croire Whisper** (vécu 07/10/2026). L'horodatage mot à mot coupe souvent trop tôt la
  fin d'un mot de fin de phrase (« soulager » donné fini à 879,38 alors qu'il finissait à 879,84, avec une
  micro-pause au milieu). Toujours confirmer chaque borne de FIN par l'énergie audio (vrai silence après le mot)
  ET par une retranscription isolée de la dernière seconde. Si une phrase enchaîne sans silence, chercher une
  autre prise de la même phrase dans le live (Rose se répète souvent).

## Mises en page source et recadrage

**Caméra ouverte obligatoire (exigence Rose, 22/07/2026).** Une capsule n'existe
que si la caméra du locuteur est allumée et nette sur TOUTE la plage : vérifier
la présence caméra par frames (début/milieu/fin de chaque plage candidate) AVANT
de proposer, et écarter tout passage caméra coupée (avatar, écran seul, tuile
figée) ou dégradée par un bug de connexion — même si le propos est excellent.
Ces pépites-là se notent en « réserve audio » dans REPERAGE.md, jamais en capsule.
⚠ Les VTT Teams peuvent être en retard de ~1 s sur les débuts de phrase : poser
les bornes avec l'alignement Whisper, et la vérification des bordures (étape 7)
rattrape le reste.
- Sonder la vidéo avec des frames (`ffmpeg -ss T -i src -frames:v 1 f.png`) à plusieurs
  moments : les lives changent de mise en page (côte à côte ↔ partage d'écran).
  Repérer chaque plage et définir UN crop par mise en page et par personne.
- Le crop doit être **16:9** (il sera mis à l'échelle 960×538) et centré sur le visage.
  Toujours **tester le crop sur une frame** et la regarder avant de monter.
- Bulles de commentaires/réactions incrustées en bas du flux : vérifier qu'elles ne
  rentrent pas dans le champ recadré sur la plage utilisée.
- Badge de nom incrusté dans le flux (pill LinkedIn bleue…) visible dans le crop :
  le recouvrir avec le badge du gabarit agrandi (`badge_fix` dans le job JSON).

## Image d'experte de Rose (décision du 10/10/2026)
Rose a fait supprimer « Il m'a fallu 5 ans pour comprendre la DSN » : « ce n'est pas à mon avantage, ça n'apporte rien en pédagogie ». Deux tests pour chaque passage avant de le retenir : (1) la montre-t-il experte et crédible ? (2) le spectateur apprend-il quelque chose d'utilisable ? Écarter les aveux de difficulté ou d'ignorance sur son métier (« je ne comprenais pas », « il m'a fallu des années », « de mémoire, je ne sais plus »), même sympathiques, sauf validation explicite de Rose.
