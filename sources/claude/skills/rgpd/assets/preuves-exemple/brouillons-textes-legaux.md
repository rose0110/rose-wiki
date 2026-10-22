# Brouillons des textes légaux — chantier « IA en Europe » (v3 : entité Google Cloud France, relecture finale du juriste)

> v3 du 11/09/2026 : l'entité contractante pour une adresse de facturation en France est **Google Cloud France SARL**
> (8 rue de Londres, 75009 Paris, SIREN 881 721 583), pas Google Cloud EMEA Limited (Irlande) ; la phrase sur les clauses
> contractuelles types est remplacée par la formulation du juriste (transferts opérés par Google vers ses sous-traitants,
> garanties du CDPA : CCT ou solution de transfert alternative) ; la notification devient une information sur un changement
> intervenu, avec le délai de 30 jours des art. 3.4 / 6. Les textes appliqués (PR #379) font foi ; ce fichier garde l'historique.

Règle du chantier : ces textes ne sont posés dans les pages **qu'après** la preuve en production (hôtes
`europe-*` mesurés dans les journaux). Version 1 relue par `juriste-paie` le 11/09/2026 : NO-GO avec sept
corrections ; cette v2 les applique. Ce qui reste hors de ma portée est marqué **[Rose]** ou
**[à vérifier après création du projet GCP]**.

Étiquettes : **[prouvé]** (mesure ou document officiel cité dans `sources-officielles.md`), **[déduit]**
(lu dans le code), **[à prouver en prod]**, **[A_CONFIRMER]** (document non lu en intégralité).

## Corrections exigées par le juriste et leur traitement

| # | Exigence | Traitement |
|---|---|---|
| 1 | Prouver l'entité contractante GCP (Google Cloud France, Irlande) | **[à vérifier après création du projet GCP]** : lire la page Facturation → « Entité Google » ; si Google LLC, réécrire (voir § 9). Ajouté à la liste des vérifications avant publication. |
| 2 | Remplacer partout « aucun transfert hors UE » | Fait : formulation stricte du juriste reprise mot pour mot (§ 1, § 2 art. 4 h et art. 5, § 3, § 4). |
| 3 | Corriger la conservation (journalisation anti-abus jusqu'à 30 jours, revue humaine possible) | Fait (§ 2 art. 5, § 5 S-006). Demande d'exemption = geste de Rose (formulaire Google) **[Rose]**. |
| 4 | Sourcer l'absence d'entraînement sur une clause contractuelle | Fait : Service Specific Terms § 18 « Training Restriction », dernière modification 29/07/2026 (`sources-officielles.md` § 4). |
| 5 | Trancher Anthropic et Web Grounding for Enterprise | Anthropic : le modèle est servi par Google Cloud comme « fully managed and serverless » (doc Google 03/09/2026) ; aucune source lue ne dit qu'Anthropic reçoit des données, aucune ne dit le contraire → **[A_CONFIRMER]**, Anthropic n'est PAS ajouté comme sous-traitant, et la phrase publique dit « servi par Google Cloud » sans plus. Web Grounding for Enterprise : décrit honnêtement (§ 1) — la requête de recherche est traitée dans la requête Vertex par « GCP's web index » (SST § 20 l) ; rétention : SST § 20(h) (« not store […] longer than is reasonably necessary »), doc zéro rétention (voie recommandée). |
| 6 | Compléter S-006 (art. 30.2) et corriger la qualification 9.2.b | Fait (§ 5). |
| 7 | Trancher `DPA_CURRENT_VERSION` (art. 15 : modification substantielle = re-signature) | **[Rose]** : (a) incrémenter → re-signature de tous les clients ; (b) ne pas incrémenter et consigner par écrit que la modification est jugée non substantielle. Le juriste juge (b) difficile à tenir. Rien n'est changé tant que Rose n'a pas tranché ; le texte de notification est prêt. |

## Décision sur la pseudonymisation promise (DPA Annexe 1, art. 3.3 ; pages rgpd / confidentialité ; CONFORMITE § 9.2)

**Retirée.** Motifs : (1) `src/library/ai/pseudonymize.js` n'est appliqué nulle part [déduit, grep : aucun
importeur] — la promesse était fausse depuis l'origine ; (2) ses expressions régulières masquent toute date
et tout nombre de 9 ou 14 chiffres, ce qui casse les calculs de paie ; (3) elle ne masque ni les noms en
texte libre ni les PDF/images. Conséquence assumée, mot du juriste : **aucune mesure de minimisation ne
subsiste en amont de l'inférence**. Aucun texte ne dira « seules les données nécessaires sont transmises ».
Une pseudonymisation structurée des DSN reste un chantier à part, non promis.

## 1. [v2 — SUPERSÉDÉ par les fichiers appliqués, PR #379] `/legal/sous-traitants` (page.js)

- `description` : « Liste publique et à jour des sous-traitants de Smart Data Pay — hébergement en France,
  traitements d'IA exécutés en Union européenne. »
- Badge : « ✓ Hébergement en France — IA traitée en Union européenne ».
- Retirer la ligne « Infrastructure IA souveraine ». Ajouter :
  - **Google Cloud France (Vertex AI)** — Finalité : « Exécution des modèles d'intelligence
    artificielle (Gemini de Google ; Claude d'Anthropic, servi par Google Cloud) pour l'assistant
    conversationnel, l'Agent Paie, le contrôle de paie, le report de congés, le résumé, la lecture vocale et
    la recherche web ancrée » — Localisation : « Union européenne — Belgique (région `europe-west1`) » —
    Hors UE : « Non (société établie en France ; groupe dont la société mère est établie aux États-Unis,
    voir ci-dessous) ». [à prouver en prod : hôte mesuré] [à vérifier : entité contractante]
- Paragraphe « Absence totale de transfert hors UE » → titre « Localisation des traitements », texte du
  juriste :
  « Smart Data Pay héberge la base de données et l'application en France (Paris). Les traitements
  d'intelligence artificielle sont exécutés dans une région de l'Union européenne (Belgique) par Google
  Cloud EMEA Limited, société établie en France ; l'application refuse tout appel qui ne passerait pas
  par cette région. Smart Data Pay ne recourt à aucun sous-traitant établi en dehors de l'Union
  européenne. Google Cloud France appartient à un groupe dont la société mère est établie aux
  États-Unis : un accès depuis un pays tiers — pour une opération de support ou en réponse à une demande
  d'une autorité étrangère — ne peut pas être exclu. Un tel accès constituerait un transfert au sens du
  chapitre V du RGPD ; il est encadré par les clauses contractuelles types de la Commission européenne
  figurant au Cloud Data Processing Addendum de Google Cloud. »
- Ajouter un paragraphe « Recherche web » : « Lorsque l'assistant effectue une recherche web, la requête
  qu'il formule est traitée dans la même requête Vertex AI, à partir de l'index web de Google Cloud (Web
  Grounding for Enterprise). Elle peut contenir des éléments de la question posée. »
- `lastUpdate` : date de mise en ligne.

## 2. [v2 — SUPERSÉDÉ par les fichiers appliqués, PR #379] `/legal/dpa` (page.js)

- `description` : « … Données hébergées en France, traitements d'IA exécutés en Union européenne. »
- Version affichée : `1.1` **si Rose retient l'option (a)** ; sinon inchangée. **[Rose]**
- Art. 4 h) (texte du juriste) : « ne recourir à aucun sous-traitant ultérieur établi en dehors de l'Union
  européenne. Lorsqu'un sous-traitant ultérieur établi dans l'Union appartient à un groupe dont une
  entité est établie hors de l'Union, Smart Data Pay s'assure que tout accès depuis un pays tiers est
  encadré par les clauses contractuelles types adoptées par la Commission européenne ; »
- Art. 5 (remplace les deux paragraphes) :
  « Smart Data Pay héberge l'ensemble des données du Client au sein de l'Union européenne (base de
  données et application à Paris). Les traitements d'intelligence artificielle sont exécutés dans une
  région de l'Union européenne (Belgique, `europe-west1`) par des modèles de langage (Gemini de Google ;
  Claude d'Anthropic, servi par Google Cloud) fournis par Google Cloud France, société établie en
  Irlande, qui figure à ce titre dans la liste des sous-traitants ultérieurs (Annexe). Smart Data Pay
  n'adresse aucun appel à un service d'intelligence artificielle dont le traitement s'exécuterait en
  dehors de l'Union européenne, et l'application refuse techniquement tout appel qui ne passerait pas
  par cette région. Google Cloud France appartient à un groupe dont la société mère est établie aux
  États-Unis : un accès depuis un pays tiers, pour une opération de support ou en réponse à une demande
  d'une autorité étrangère, ne peut pas être exclu ; il constituerait un transfert au sens du chapitre V
  du RGPD, encadré par les clauses contractuelles types de la Commission européenne figurant au Cloud
  Data Processing Addendum de Google Cloud.
  Les contenus transmis aux modèles ne sont pas utilisés pour les entraîner (Google Cloud, Service
  Specific Terms, § 18 « Training Restriction »). Ils peuvent être conservés jusqu'à trente jours par
  Google Cloud, dans la même région, aux seules fins de détection des usages abusifs, et être examinés
  par des personnels autorisés de Google en cas de signalement ; Smart Data Pay a demandé à Google Cloud
  l'exemption de cette journalisation — tant qu'elle n'est pas accordée, cette conservation s'applique. »
  [la phrase « a demandé » n'est écrite que si Rose a fait la demande ; sinon : « Smart Data Pay
  demandera » ou suppression] **[Rose]**
- Art. 7, puce « Pseudonymisation… » → « **Traces techniques minimisées** : les journaux d'appel aux
  modèles d'IA ne contiennent que l'hôte contacté, le modèle, l'opération, le statut et la durée — jamais
  le contenu ; » [à prouver en prod : extrait de journal]
- Art. 8 inchangé (aucun entraînement) — désormais sourcé : SST § 18 [prouvé].

## 3. [v2 — SUPERSÉDÉ par les fichiers appliqués, PR #379] `/legal/rgpd` (page.js)

- `description` : « Engagement RGPD de Smart Data Pay : hébergement en France, traitements d'IA
  exécutés en Union européenne, aucun entraînement sur vos données. »
- Carte « 🇫🇷 100 % France / UE » → « 🇫🇷 Hébergement à Paris : base de données et application. Les
  traitements d'IA sont exécutés dans l'Union européenne (Belgique). »
- Carte « 🤖 IA auto-hébergée » → « 🇪🇺 IA en Europe : nos assistants utilisent des modèles (Gemini ;
  Claude, servi par Google Cloud) exécutés par Google Cloud France en région européenne.
  L'application refuse tout appel d'IA qui ne passerait pas par cette région. »
- Carte « 🔒 Pseudonymisation automatique » → « 📄 Traces sans données personnelles : nos journaux
  d'appels IA n'enregistrent que l'hôte, le modèle et la durée, jamais vos contenus. Vos données ne
  servent jamais à entraîner un modèle. »
- Retirer toute occurrence de « aucun transfert hors UE ».

## 4. [v2 — SUPERSÉDÉ par les fichiers appliqués, PR #379] `/legal/politique-confidentialite` (page.js)

- § 4 : « Hébergement en France, traitements d'IA exécutés en Union européenne. La liste… » (retirer
  « Aucun transfert hors Union européenne »).
- § 5 : « L'assistant conversationnel s'appuie sur des modèles de langage (Gemini de Google ; Claude
  d'Anthropic, servi par Google Cloud) exécutés par Google Cloud France dans une région de l'Union
  européenne (Belgique). Vos messages leur sont transmis pour produire la réponse ; ils ne servent pas à
  les entraîner et peuvent être conservés jusqu'à trente jours par Google Cloud aux seules fins de
  détection des usages abusifs. Vous pouvez supprimer ou exporter votre historique à tout moment. »

## 5. [v2 — SUPERSÉDÉ par les fichiers appliqués, PR #379] `REGISTRE_RGPD.md`

- En-tête : ajouter les mentions art. 30.2 communes : « Sous-traitant : SMART DATA PAY (SDP), SAS, Bureau
  326, 78 avenue des Champs-Élysées, 75008 Paris — point de contact RGPD : Rose SONGUE,
  rose.yemeli@yso-conseils.com — pas de DPO désigné — pas de représentant (établissement dans l'UE) ».
- S-003 : sous-traitants ultérieurs → « Google Cloud France (France) — Vertex AI, région
  `europe-west1` (Belgique) : modèles Gemini ; Claude, servi par Google Cloud ; Supabase (FR) » ;
  transferts : « Aucun sous-traitant établi hors UE. Accès éventuel depuis un pays tiers par le groupe
  Google : clauses contractuelles types du Cloud Data Processing Addendum (document à archiver) » ;
  mesures : retirer « Pseudonymisation automatique… », ajouter « Passerelle unique vers la région UE avec
  refus de tout autre terminal ; traces d'appel sans contenu ; aucun entraînement (SST § 18) ».
- Nouveau **S-006 — Contrôle de paie et calculs assistés par IA** :
  - Finalité : pour le compte du Client, lecture par un modèle d'IA de bulletins, DSN et tableaux de
    charges collés ou téléversés (contrôle de paie) ; calcul du report de congés après arrêt.
  - Responsables du traitement pour le compte desquels le traitement est effectué : chaque Client ayant
    souscrit au service (liste tenue dans la table des contrats, `sdp_contracts`).
  - Personnes concernées : salariés du Client.
  - Catégories de données (texte du juriste) : « identité, NIR, rémunérations, absences et arrêts de
    travail — ces derniers pouvant révéler indirectement des données relatives à la santé. Ces données
    sont traitées pour le compte du Client, responsable du traitement, sur la base qu'il invoque au titre
    de l'article 9.2.b du RGPD (obligations en matière de droit du travail et de sécurité sociale). »
  - Sous-traitants ultérieurs : Google Cloud France — Vertex AI `europe-west1` (Gemini 2.5 Flash en
    lecture, Claude Sonnet 4.5 servi par Google Cloud en vérification) ; Supabase (FR) ; Vercel (FR).
  - Transferts vers un pays tiers : aucun sous-traitant établi hors UE ; accès éventuel depuis un pays
    tiers par le groupe Google encadré par les clauses contractuelles types (Cloud Data Processing
    Addendum de Google Cloud — document de garantie à archiver).
  - Conservation côté IA : pas de conservation au-delà du traitement (SST § 20 h), hors journalisation
    anti-abus jusqu'à 30 jours tant que l'exemption n'est pas accordée.
  - Mesures de sécurité : passerelle unique UE, traces sans contenu, plafonds de dépense IA, RLS.
  - AIPD : incombe au Client (art. 35) ; Smart Data Pay l'assiste (art. 28.3.f). **Ne pas écrire « AIPD
    non requise »** ; recommandation du juriste : produire une AIPD modèle pour les clients **[Rose]**.
- Annexe sous-traitants : retirer « Infrastructure IA souveraine », ajouter Google Cloud France
  (Vertex AI) — UE, Belgique `europe-west1` — DPA : Cloud Data Processing Addendum — Date : celle de la
  création du projet GCP.

## 6. [v2 — SUPERSÉDÉ par les fichiers appliqués, PR #379] `DPA_ACCORD_SOUS_TRAITANCE.md`, `CONFORMITE_RGPD.md`, `docs/rgpd-ia-controle-paie.md`

- DPA md art. 3.3 : retirer « la pseudonymisation systématique avant transmission à l'assistant
  conversationnel » ; art. 6 : même texte que l'art. 5 de la page ; Annexe 1 ligne « Pseudonymisation
  IA » → « Traces IA minimisées » ; Annexe 2 : Google Cloud France.
- CONFORMITE_RGPD.md § 5, 7, 8, 9 : remplacer « auto-hébergé / souverain / aucun fournisseur tiers /
  pseudonymisation / zéro transfert » par la description Vertex UE (mêmes phrases que § 2) ; schéma
  § 9.1 : « Google Cloud Vertex AI — région europe-west1 (Belgique) » ; journal de versions : ligne 2.1.
- docs/rgpd-ia-controle-paie.md : en-tête « Statut : chantier « IA en Europe » livré le … — option 2
  appliquée (Vertex UE via passerelle unique), option A (masquage) non retenue ».

## 7. Texte de notification aux clients ayant accepté le DPA (v3, préparé, NON envoyé — décision de Rose)

Objet : Mise à jour de notre accord de sous-traitance — traitements d'IA exécutés en Union européenne

Bonjour,

Nous vous informons d'une mise à jour de l'accord de sous-traitance (DPA) qui nous lie, entrée en vigueur le
11 septembre 2026, à l'article 5, à l'annexe « Sécurité » et à la liste des sous-traitants ultérieurs.

Ce qui change : les fonctions d'intelligence artificielle de Smart Data Pay (assistant, Agent Paie, contrôle de paie,
report de congés, résumé et lecture vocale) sont exécutées par des modèles de langage (Gemini de Google ; Claude
d'Anthropic, servi par Google Cloud) fournis par Google Cloud France, société établie en France, dans une région de
l'Union européenne (Belgique). Google Cloud France est ajouté à la liste des sous-traitants ultérieurs. L'application
refuse tout appel d'IA qui ne passerait pas par cette région. La base de données et l'application restent hébergées à
Paris. Les contenus transmis aux modèles peuvent être conservés jusqu'à trente jours par Google Cloud, aux seules fins
de détection des usages abusifs.

Ce qui ne change pas : vos données ne servent jamais à entraîner un modèle.

Ce que nous corrigeons : les versions précédentes de nos pages et du DPA décrivaient une IA « auto-hébergée, sans
fournisseur tiers », une absence de tout transfert hors Union européenne et une pseudonymisation automatique avant
inférence, inscrite à l'annexe « Sécurité ». Ce n'était pas exact : nos appels d'IA passaient par des services tiers,
dont certains situés aux États-Unis, et la pseudonymisation n'a jamais été mise en place. Cet engagement est retiré de
l'annexe ; il est remplacé par des traces d'appel sans contenu. Nous tenons la preuve technique de la nouvelle
architecture à votre disposition, ainsi que les éléments nécessaires à la mise à jour de votre registre et de
l'information de vos salariés.

Conformément à l'article 3.4 de l'accord (article 6 de la version en ligne), vous disposez d'un délai de trente jours
à compter de ce message pour nous faire part d'une opposition motivée. Pour toute question : support@smartdatapay.com.

L'équipe Smart Data Pay

(Destinataires : table `dpa_acceptances`, une ligne par compte ayant accepté la version 1.0 — extraction au moment de
l'envoi, sur décision de Rose. Le juriste le dit : Vertex étant déjà en production, ce courrier est une information sur
un changement intervenu, assortie du droit d'opposition — pas un préavis. Sa position sur la version : incrémenter en 1.1
identifie le texte ; exiger ou non une nouvelle acceptation reste le choix de Rose, mais le retrait d'un engagement de
sécurité de l'annexe rend la position « non substantiel » difficile à tenir.)

## 8. La phrase d'Andy sur le stand

« Vos données sont hébergées en France, et l'IA qui les lit tourne en Europe. »

Défendable (verdict du juriste) sous réserve de la preuve en production. Ne pas dire : « souveraine »,
« sans fournisseur tiers », « aucune donnée ne quitte la France », « aucun transfert hors UE », « vos
données ne sont pas conservées », ni dériver vers « tourne en France » (la Belgique n'est pas la France).
Réponse préparée à la question CLOUD Act : « le prestataire est une société française du groupe Google, le traitement se fait en
Belgique, et le groupe est américain ; un accès depuis les États-Unis est encadré par les clauses
contractuelles types, il n'est pas impossible. »

## 9. Vérifications à faire avant de publier (checklist)

1. Preuve prod : hôtes `europe-west1-aiplatform.googleapis.com` dans les journaux, aucun autre.
2. Entité contractante du projet GCP = Google Cloud France (adresse de facturation en France, première facture). Si
   Google Cloud EMEA Limited (adresse hors France) : remplacer l'entité ; si Google LLC : tout réécrire.
3. Cloud Data Processing Addendum et liste des sous-traitants Google lus et archivés dans
   `sources-officielles.md`.
4. Exemption de journalisation anti-abus demandée (ou phrase adaptée).
5. Décision de Rose sur `DPA_CURRENT_VERSION` et sur l'envoi de la notification (avant mise en ligne).
