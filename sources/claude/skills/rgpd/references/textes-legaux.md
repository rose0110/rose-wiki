# Textes légaux — ce qu'on peut écrire, ce qu'on ne peut plus écrire

Relu par `juriste-paie` le 11/09/2026 (NO-GO v1, v2 acceptée sous réserve de la preuve prod). Le texte
complet appliqué chez SDP est dans `assets/preuves-exemple/brouillons-textes-legaux.md` ; le script
d'application est dans la session du chantier (`appliquer-pr2-legal.cjs`). Règle du chantier : **les
pages ne changent qu'après la preuve prod** (hôtes `europe-*` dans les journaux), en PR séparée.

## Interdits (ne jamais écrire)

- « aucun transfert hors UE », « zéro transfert », « aucune donnée ne quitte la France » ;
- « IA souveraine », « auto-hébergée », « sans fournisseur tiers », « modèle open-source déployé en interne » ;
- « pseudonymisation automatique avant inférence » si elle n'est pas réellement appliquée ;
- « vos données ne sont pas conservées » (la journalisation anti-abus existe jusqu'à 30 jours) ;
- « AIPD non requise » (elle incombe au client, on l'assiste) ;
- « tourne en France » pour l'IA (la Belgique n'est pas la France) ;
- dans un écrit client : « bonne nouvelle » et toute formule vendeuse (règle 13).

## Formulations validées (à reprendre mot pour mot, entité adaptée)

**Localisation des traitements** (page sous-traitants, DPA art. 5, conformité § 8) :
« Smart Data Pay héberge la base de données et l'application en France (Paris). Les traitements
d'intelligence artificielle sont exécutés dans l'Union européenne, par les points de terminaison européens
de Google Cloud (région `europe-west1` et zone multi-région « Union européenne », dont le traitement reste
dans les États membres de l'Union), par **Google Cloud France**, société établie en France ; l'application
refuse tout appel qui ne passerait pas par ces points de terminaison européens.* [*25/09/2026 : « Belgique »
retiré — voir lecons-et-pieges.md ; formulation soumise au juriste sur SDP PR #481.] Smart Data Pay ne recourt à aucun sous-traitant établi en dehors de l'Union
européenne. Google Cloud France appartient à un groupe dont la société mère est établie aux États-Unis :
un accès depuis un pays tiers, pour une opération de support ou en réponse à une demande d'une autorité
étrangère, ne peut pas être exclu. Un tel accès constituerait un transfert au sens du chapitre V du RGPD ;
il est encadré par les clauses contractuelles types de la Commission européenne figurant au Cloud Data
Processing Addendum de Google Cloud. »

> Entité : dépend de l'adresse de facturation du compte Google Cloud (France → Google Cloud France ;
> reste de l'EMEA → Google Cloud EMEA Limited, Irlande). Tableau officiel du 30/06/2026.

**Modèles** : « des modèles de langage (Gemini de Google ; Claude d'Anthropic, servi par Google Cloud) ».
Anthropic n'est **pas** inscrit comme sous-traitant : aucune source lue ne dit qu'Anthropic reçoit des
données (« fully managed and serverless » côté Google), aucune ne dit le contraire → `A_CONFIRMER`.

**Entraînement** : « Les contenus transmis aux modèles ne sont pas utilisés pour les entraîner (Google
Cloud, Service Specific Terms, § 18 « Training Restriction »). »

**Conservation** : « Ils peuvent être conservés jusqu'à trente jours par Google Cloud, dans la même
région, aux seules fins de détection des usages abusifs, et être examinés par des personnels autorisés
de Google en cas de signalement ; cette conservation s'applique tant que Smart Data Pay n'a pas obtenu
de Google Cloud l'exemption de cette journalisation. »

**Recherche web** : « Lorsque l'assistant effectue une recherche web, la requête qu'il formule est
traitée dans la même requête Vertex AI, à partir de l'index web de Google Cloud (Web Grounding for
Enterprise). Elle peut contenir des éléments de la question posée. »

**Traces** (remplace la pseudonymisation) : « les journaux d'appel aux modèles d'IA ne contiennent que
l'hôte contacté, le modèle, l'opération, le statut et la durée — jamais le contenu ».

**Art. 4 h du DPA** : « ne recourir à aucun sous-traitant ultérieur établi en dehors de l'Union
européenne. Lorsqu'un sous-traitant ultérieur établi dans l'Union appartient à un groupe dont une entité
est établie hors de l'Union, Smart Data Pay s'assure que tout accès depuis un pays tiers est encadré par
les clauses contractuelles types adoptées par la Commission européenne. »

## Ce que la relecture finale du juriste a ajouté (11/09/2026, après application)

- **Transferts, avec une entité française** : ne pas écrire « encadré par les clauses contractuelles types » (cela laisse
  croire que l'application est partie aux CCT ; l'exportateur d'un éventuel accès est Google, et le CDPA prévoit CCT **ou**
  solution de transfert alternative). Formulation retenue : « Un tel accès constituerait un transfert au sens du chapitre V
  du RGPD. Les transferts opérés par Google vers ses propres sous-traitants établis hors de l'Union européenne sont
  encadrés par les garanties prévues au Cloud Data Processing Addendum de Google Cloud (clauses contractuelles types de la
  Commission européenne ou, lorsque Google en a adopté une, une solution de transfert alternative). Smart Data Pay tient ce
  document à la disposition du Client. » Ne jamais citer un numéro de paragraphe du CDPA sans l'avoir lu en texte intégral.
- **Identifier la personne morale** dans les annexes contractuelles et le registre : « Google Cloud France SARL — 8 rue de
  Londres, 75009 Paris — SIREN 881 721 583 » (deux entités portent le nom « Google Cloud France » au SIRENE ; vérifié sur
  recherche-entreprises.api.gouv.fr).
- **Chercher partout où le produit parle de son IA**, pas seulement dans `/legal` : bandeau ou modale « Conformité RGPD »
  dans l'application, pages de vente et pages partenaires, **contrat PDF généré à la souscription** (signé par chaque
  client !), documents Markdown du dossier de conformité (politique, AIPD), site vitrine (dépôt séparé). Grep :
  `souverain|auto-héberg|IA opérée en interne|aucun transfert hors|pseudonymisation automatique|sans fournisseur tiers`.
- **AIPD** : une AIPD fondée sur de fausses prémisses se marque « obsolète — ne pas communiquer » en tête, et le renvoi
  contractuel qui pointe vers elle est retiré, tant qu'une v2 n'est pas produite (réévaluer le risque de transfert et
  réexaminer explicitement l'article 36).
- **Version du DPA** : incrémenter identifie le texte (les acceptations « 1.0 » ne doivent pas couvrir deux textes
  différents — clause de preuve art. 1366-1367 C. civ.) ; exiger ou non une nouvelle acceptation des clients existants
  reste la décision de Rose. Retirer un engagement de sécurité de l'annexe (pseudonymisation) rend la position « non
  substantiel » difficile à tenir. Le DPA Markdown signé hors ligne doit porter version et date.
- **Notification** : le délai et les articles cités doivent être ceux du contrat (30 jours, art. 3.4 / 6 chez SDP) ; dire le
  retrait de l'engagement de pseudonymisation et la conservation de 30 jours ; si la bascule est déjà en production,
  c'est une information sur un changement intervenu (avec droit d'opposition), pas un préavis.
- **Registre** : la dirigeante est « représentante légale / point de contact RGPD », jamais « responsable du traitement »
  dans un registre de sous-traitant (art. 30.2) ; ajouter la conservation côté fournisseur sur chaque traitement IA.
- **URL des annexes** : pointer la route réelle (`/legal/sous-traitants`) sur le domaine de l'application, pas le site vitrine.
- « Aucun sous-traitant établi hors UE » ne vaut qu'au **premier rang** : la liste des sous-traitants de Google reste à lire.

## Les documents à toucher (SDP ; adapter les chemins)

| Document | Ce qui change |
|---|---|
| `src/components/agent/AgentSecurityBanner.js`, page partenaire, `src/library/contracts/pdf-generator.js` (contrat de souscription), `POLITIQUE_CONFIDENTIALITE.md`, `AIPD_ASSISTANT_IA.md` | tout ce qui dit « IA opérée en interne / souveraine / pseudonymisation » — trouvé par la relecture finale, pas par les brouillons |
| `/legal/sous-traitants` | ligne « Infrastructure IA souveraine » → « Google Cloud France (Vertex AI) », badge, § Localisation, § Recherche web, date |
| `/legal/dpa` | description, art. 4 h, art. 5 (3 paragraphes), art. 7 puce traces, date ; **version** = arbitrage de Rose |
| `/legal/rgpd` | trois cartes (Paris / IA en Europe / Traces), description, date |
| `/legal/politique-confidentialite` | § 4 hébergement, § 5 assistant |
| `REGISTRE_RGPD.md` | en-tête art. 30.2 (sous-traitant, contact, pas de DPO, pas de représentant), S-003, **nouveau S-006** (contrôle de paie : identité, NIR, rémunérations, arrêts → santé indirecte, art. 9.2.b invoqué par le client ; AIPD au client), annexe |
| `DPA_ACCORD_SOUS_TRAITANCE.md` | 3.3, art. 6, annexes 1-3 |
| `CONFORMITE_RGPD.md` | version, § 1, § 5.6, § 7, § 8, § 9 réécrit, historique |
| `docs/rgpd-ia-*.md` | statut : chantier livré, option appliquée |

## La version du DPA — arbitrage de Rose

Art. 15 du DPA : modification substantielle = notification + nouvelle acceptation. Deux options :
(a) incrémenter `DPA_CURRENT_VERSION` (SDP : `src/library/legal/dpa.js` **et** la page) → tous les clients
re-signent ; (b) ne pas incrémenter et consigner par écrit que la modification est jugée non substantielle
(le juriste juge (b) difficile à tenir). Sans décision : les textes deviennent vrais, la version reste, et
le compte rendu le dit.

## Notification aux clients (préparée, JAMAIS envoyée sans décision de Rose)

Texte complet dans `assets/preuves-exemple/brouillons-textes-legaux.md` § 7. Structure : ce qui change
(sous-traitant ultérieur ajouté, région UE, refus technique), ce qui ne change pas (aucun entraînement),
**ce que nous corrigeons** (les anciennes pages étaient inexactes — dit sans détour), délai d'opposition
de 60 jours, contact. Destinataires : table des acceptations du DPA, extraite au moment de l'envoi.
Point du juriste : le préavis court **avant** la mise en œuvre ; si la bascule est déjà en prod au moment
de l'envoi, le dire à Rose.

## La phrase de stand

« Vos données sont hébergées en France, et l'IA qui les lit tourne en Europe. »
Réponse préparée à la question CLOUD Act : « le prestataire est une société française du groupe Google,
le traitement se fait en Belgique, et le groupe est américain ; un accès depuis les États-Unis est encadré
par les clauses contractuelles types, il n'est pas impossible. »

## Checklist avant publication

1. Preuve prod archivée (hôtes `europe-*`, zéro `refused`).
2. Entité contractante confirmée (première facture).
3. Cloud Data Processing Addendum (version datée) et Service Specific Terms archivés dans `sources-officielles.md`.
4. Exemption anti-abus demandée, ou phrase « tant que… » conservée.
5. Décision de Rose sur la version du DPA et sur la notification.
6. Aucun des interdits ci-dessus ne subsiste (grep sur `souverain`, `auto-héberg`, `hors UE`, `pseudonymis`).
