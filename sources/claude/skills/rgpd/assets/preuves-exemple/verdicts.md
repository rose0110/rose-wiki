# Verdicts écrits — chantier « IA en Europe » (11/09/2026)

Chaque verdict porte sur un état précis de la branche ; les corrections exigées sont listées avec leur
traitement. Les verdicts complets (texte intégral des agents) sont dans les transcriptions de session ;
ce fichier en garde l'essentiel vérifiable.

## 1. `securite-rgpd` — sur `ef6314b1b` (premier commit)

**Verdict : NO-GO**, 4 corrections exigées + 7 durcissements.

Ce que l'agent a MESURÉ et qui a tenu : express mode `GOOGLE_VERTEX_API_KEY` refusé avant émission
(aucune émission réelle) ; régions `us-central1` / `global` / `eu` refusées à la lecture de la
configuration ; clé privée jamais exposée ; trace sans prompt/corps/jeton ; `test:ia-europe` 18/18,
`network` 5/5, `controles` 5/5, `ccn-c05` 32/32 ; fichiers supprimés sans importeur ; diff dans le
périmètre ; aucun secret réel.

| # | Constat | Traitement (commit 2) |
|---|---|---|
| 1 | `err.message` journalisé (Vercel + table `ai_usage`) sur les chemins IA : le SDK y embarque la SORTIE du modèle (`JSONParseError « Text: … »`, `TypeValidationError « Value: … »`), donc ce qu'il a lu d'un bulletin/DSN. | Fait : `meter.js` journalise `safeErrorLabel(err)` (nom, code, statut, jamais le message) ; catch des routes contrôles (executer, comparer, dsn-charges), report de congés, résumé, voix, résumé de conversation, audit simulateur, recherche web, `source-ia.js` → code seulement. |
| 2 | `/api/agent/events` renvoyait au client le message brut du fournisseur (`onError`) ; idem `controles/executer:281`, `comparer`, `dsn-charges`, `agenda`. | Fait : libellé métier + code ; messages génériques côté client. Outils d'embedding (`legal-tools`, `agent/events` rechercherDocuments) : code seulement. |
| 3 | Pages légales dans le même lot (fenêtre où l'écrit reste faux entre la pose des variables et la PR 2). | **Décision** : la règle du prompt de Rose prévaut (« modifiées qu'après la preuve, jamais avant »). Pour réduire la fenêtre à quelques minutes, la séquence pose des variables → preview → mise en ligne → preuve → PR 2 sera enchaînée sans interruption dès réception de la clé. Les pages sont déjà fausses aujourd'hui ; le chantier ne l'aggrave pas. |
| 4 | Déployer sans variables = 503 sur toutes les fonctions IA. | C'est prévu ainsi : aucun déploiement avant la pose des variables et leur preuve (règle « aucun déploiement partiel »). |
| D-1 | Neutraliser l'express mode (`apiKey: ''`). | Fait + test (« express mode neutralisé »). |
| D-2 | Jeton de test gardé seulement par `VERCEL_ENV`. | Fait : ignoré dès que `VERCEL=1` (toute cible Vercel) ou production ; test mis à jour. |
| D-3 | `getAccessToken` exposé sur l'objet public ; portée `cloud-platform`. | `getAccessToken` retiré de la surface publique. La portée reste `cloud-platform` (exigée par Vertex) ; la limitation vient du rôle IAM `roles/aiplatform.user` demandé à Rose. |
| D-4 | Erreur de région = `Error` simple → 500 générique au lieu de 503. | Fait : `status = 503`, `gatewayErrorResponse` reconnaît tout code `AI_GATEWAY_*` ; chat mappe aussi la construction initiale du modèle. |
| D-5 | DeepSeek déplacé, pas retiré. | Assumé et documenté (inventaire § 1.3) : pipelines batch CCN, textes publics, bloqués par `assertCcnMassConsensusExternalAiDisabled`. |
| D-6 | Scanner de secrets : 6 détections nouvelles, toutes fictives. | Réécrites (`[…].join()`) : plus aucune détection dans les fichiers du chantier (16 restantes = préexistantes). |
| D-7 | La garde réseau n'existe qu'en test ; en prod seul `tracedFetch` protège. | Vrai. Formulation retenue pour le DPA : « refuse techniquement tout appel qui ne passerait pas par cette région » vaut pour la passerelle ; un code futur qui l'ignorerait est arrêté par la CI (frontière statique), pas à l'exécution. Dit dans le récap. |

Points RGPD hors code, relayés à Rose : double envoi des documents (primaire + vérificateur) à assumer
par écrit ; plafond de taille manquant sur PDF/images de `dsn-charges` ; AIPD ; version et date du Cloud
Data Processing Addendum à archiver.

## 2. `juriste-paie` — sur les brouillons v1

**Verdict : NO-GO**, 7 corrections → appliquées dans `brouillons-textes-legaux.md` v2 (tableau en tête du
fichier). Deux arbitrages de Rose : `DPA_CURRENT_VERSION` (art. 15) et l'envoi/le moment de la
notification (préavis avant mise en œuvre). Sources non lues en intégralité : CDPA, liste des
sous-traitants Google, page « Abuse monitoring » → `sources-officielles.md` § 8.

## 3. `testeur-qa` — sur `16cb93d2a` (après rebase, outils en `inputSchema`)

**Verdict : NO-GO en l'état, « levable par deux vérifications précises »** (mots de l'agent). Ce que l'agent a
MESURÉ et qui a tenu : `test:ia-europe:all` 24/24, `test:controles` 5/5, `test:agent-guard` 17/17 ; aucun
`parameters:` résiduel ; fichiers supprimés sans importeur ; 16 → 0 fichiers de `src/` important un
fournisseur ; clé `providerOptions.vertex` correcte (768 dimensions mesurées) ; conversion réelle des schémas
zod litigieux par le convertisseur du SDK ; deux scénarios `streamText` sur modèle factice (argument d'outil
invalide → `tool-error`, pas de fuite du `Value: …` vers le client).

| # | Constat | Statut donné par l'agent | Traitement (commit 3) |
|---|---|---|---|
| 1 | Indexation des documents de l'Agent Paie : `embedMany` à 50 valeurs sur `:predict` de `gemini-embedding-001` serait refusé (une instance par requête). | déduit — bloquant si confirmé | **Réfuté par la mesure** : `scripts/ia-europe/verifier-capacites-avancees.mjs` avec la vraie clé → 50 embeddings de 768 dimensions en UN appel `predict`, 200, 2,8 s (`verification-capacites-avancees-2026-09-11.json`). |
| 2 | Le lecteur des bulletins/DSN change d'éditeur (Claude direct → Gemini via Vertex, vérificateur Gemini → Claude) sans comparaison avant/après. | majeur | Exact. Le « avant » ne rendait rien (422, clé Anthropic morte) : comparaison impossible. À mesurer en production sur le bulletin de référence de l'expert paie (§ 4). |
| 3 | Codes techniques à l'écran : « (code AI_APICallError) » dans le flux de l'Agent Paie. | majeur (règle de Rose du 11/09) | **Corrigé** : messages sans code dans `agent/events/route.js` ; le code reste dans le journal serveur. |
| 4 | La validation des arguments d'outil devient effective : un nombre rendu en chaîne ferait échouer un outil de calcul. | majeur, non mesuré sur Vertex | Mesuré avec la vraie clé : Gemini 2.5 Pro et Claude Sonnet 4.5 appellent `calculBrutNet` avec `{ brut: 2800 }` typé nombre. Pas de `z.coerce` ajouté (changement de contrat non demandé). Point 3 du plan post-déploiement. |
| 5 | Troncatures silencieuses (résumé 20 000 caractères, voix 4 000). | mineur / majeur | Préexistantes (mêmes constantes sur master), hors périmètre ; notées pour un correctif séparé. |
| 6 | `getModelVerificateur()` appelé hors du `try` : la « dégradation propre » du 2e avis ne se produit pas si la passerelle n'est pas configurée. | mineur | **Corrigé** (`source-ia.js`). |
| 7 | Textes utilisateur sans accents (« Le controle n a pas pu aboutir », « momentanement »). | mineur | **Corrigé** (contrôles, passerelle, Agent Paie). |
| 8 | Pont `src/library/cdtn/claude-cli.mjs` (CLI `claude` lancé par `spawn`) invisible pour la frontière statique. | réserve | **Garde ajoutée** : 25e test « aucun importeur du pont, personne ne lance le CLI claude » ; vérifié qu'il attrape un fichier témoin. Le fichier reste en quarantaine du préflight C09. |
| 9 | Recherche web : `result.sources` non prouvé non vide. | réserve | Mesuré : 7 sources (URL de redirection `vertexaisearch.cloud.google.com`, forme normale du grounding Vertex). |
| 10 | Claude avec outil + thinking, Gemini 2.5 Pro avec outil : jamais exécutés avec une vraie clé. | non prouvé | Mesuré : 200 tous deux, un appel d'outil chacun, hôte `europe-west1`. |

Reste à prouver en production (l'agent) : chat en 200 avec texte ; contrôle de paie (422 avant → verdict attendu
sur le bulletin de référence) ; dépôt d'un document dans l'Agent Paie ; variables présentes en Production.
Critère de rollback repris : toute route en 200 avant qui ne l'est plus, un hôte IA hors `europe-*`, ou
l'indexation cassée → correctif au-dessus du dernier HEAD (jamais réassignation d'un ancien déploiement).

## 4. `expert-paie` — sur `16cb93d2a`

**Verdict : GO conditionnel.** Le moteur de calcul déterministe n'est pas touché (`moteur-bulletin.js`,
`competences/reduction-generale.js`, `paie-logic/reduction-generale.js` absents du diff) ; « le chantier
répare plus qu'il ne risque ». NO-GO sur la formulation « même verdict de paie avant/après » : elle n'est
établie que pour le report de congés.

- **Report de congés** : sortie identique avant/après (92 jours d'arrêt, cas 1, point de départ 10/07/2025,
  limite 10/10/2026) mais **fausse des deux côtés** : 30 jours reportables au lieu de 5. Les 25 jours acquis
  2024-2025 ont une période de prise 06/2025 → 05/2026 pendant laquelle le salarié a repris (01/07/2025) :
  ils suivent la prise normale et n'entrent pas dans le report de 15 mois (L.3141-19-1). Le prompt de la route
  l'impose lui-même (§ 3 CAS 1) ; le modèle ne l'applique ni avant ni après. **Défaut préexistant, hors
  périmètre du chantier** → correctif séparé (champ « jours pris pendant la période de prise », plafond
  L.3141-5-1 en avertissement). Ordre de grandeur : ≈ 2 000 € par salarié portés à tort au passif.
- **Contrôle de paie** : l'IA lit, ne calcule pas ; elle alimente `effectif`, `brut`, `heures`… (49 vs 50
  déplace la réduction générale de 629,40 € à 635,60 €). **Bulletin de référence à jouer en production** : brut
  2 000 €, 151,67 h, effectif < 50, SMIC 12,02 €/h (référentiel 2026) → coefficient **0,3147**, réduction
  **629,40 €** (concordance : calcul manuel = fonction du dépôt = `tests/audit-congres/rgdu.test.js:134`,
  9/9 rejoués). Tolérance 12,59 € : jouer aussi la variante effectif ≥ 50 (635,60 €) et lire le coefficient,
  pas seulement le statut. Pré-requis : `GET /api/referentiel` → `smic_horaire_reduction_generale = 12.02`.
- **Outils de l'Agent Paie** : 31 outils (pas 26) passés de `parameters` à `inputSchema`. Mesuré :
  `asSchema(undefined)` = schéma vide, tout passait sans contrôle. Le garde-fou de `calculMaintien` (14 entrées
  obligatoires en mode conventionnel) devient effectif. Effet de bord à vérifier au navigateur : un message Zod
  `C08_CONVENTIONAL_INPUT_REQUIRED:idcc` réinjecté au modèle pourrait être relayé à l'écran (vocabulaire
  interdit) — point 6 du plan post-déploiement.

## 5. État après corrections (commit 3)

`npm run test:ia-europe:all` 25/25 · `test:controles` 5/5 · `test:ai-budget` 30/30 · `test:ccn-c09` 144/144 ·
`test:alertes` 166/166 · `test:agent-guard` 17/17 · scanner de secrets : [MASQUÉ] détection · audit des émetteurs
d'alerte 28/28 · capacités avancées avec la vraie clé 4/4 (`verification-capacites-avancees-2026-09-11.json`).

CI de la PR : `ia-europe` (2 jobs) vert, `application`, `database`, `financial-preflight-and-static-tests`,
`contracts-security-build`, `postgres-real` verts. Rouges = permanents et identiques sur master / PR #375
(`CCN security › canonical-database`, `C09 › deterministic-security-build` et `postgres-rls-rollback`,
`C11 › deterministic-migration`, `C12 › deterministic-preview-contract` : préflight qui compare à un SHA figé et
refuse tout changement de workflow ou de route IA — `FAIL_C12_FINANCIAL_PREFLIGHT:noUnrelatedWorkflowChanged,…`).

## 6. Plan de vérification post-déploiement (fusion des deux verdicts)

| # | Action (sur www.smartdatapay.app, compte e2e) | Attendu | NO-GO / rollback si |
|---|---|---|---|
| 1 | `npm run sonde:ia-europe` | voix 200 (WAV), résumé 200, chat 200 avec texte, Agent Paie 200, contrôle ≠ 500, report de congés 200 | chat ≠ 200, contrôle en 500 |
| 2 | Agent Paie : déposer un PDF de 2-3 pages dans un projet, puis « cherche dans les documents … » | document indexé, passages cités | erreur d'indexation → rollback |
| 3 | Agent Paie : « coût employeur pour 2 800 € brut » | l'outil est appelé avec `{ brut: 2800 }`, chiffres rendus | `tool-error` visible |
| 4 | Agent Paie, modèle Claude explicite + demande de document | réponse produite | erreur de flux |
| 5 | Chat : question nécessitant la recherche web | réponse avec sources | aucune source systématiquement |
| 6 | Agent Paie : maintien **conventionnel** sans IDCC | refus en une phrase utile, **aucun `C08_…` à l'écran** | code technique visible |
| 7 | Contrôle de paie : bulletin de référence 2 000 € / 151,67 h / effectif 30 / ligne réduction générale 629,40 € | RGDU `ok`, coefficient 0,3147 ; variante effectif 120 → 0,3178 / 635,60 € ; ligne à 500 € → `attention`, écart −129,40 € | écart de justesse |
| 8 | Journaux Vercel `[ai-gateway]` | 100 % `europe-west1-aiplatform.googleapis.com`, aucun `refused` | un seul autre hôte → rollback |
| 9 | `/api/health-check/daily` | « Passerelle IA européenne » = ok, région `europe-west1` | crit |

## 7. Mise en ligne et plan post-déploiement — résultats (11/09, go de Rose ~19h50)

- Fusion #376 (squash) → master `8fe0f570a` → `mettre-en-ligne-master.mjs` : build sans domaine ; preuve 5/5 sur l'URL
  directe (après correction du script de preuve : `commitCourt` 8 caractères vs sha 9 → comparaison par préfixe) ;
  **sonde IA 7/7 sur le candidat** (`sonde-prod-directe-2026-09-11.json`) ; journaux : 28 traces, 100 %
  `europe-west1-aiplatform.googleapis.com`, 0 refus (`traces-prod-directe-2026-09-11.json`) ; promotion ; 5/5 sur www ;
  sonde 7/7 sur www (`sonde-prod-2026-09-11.json`, `traces-prod-www-2026-09-11.json`).
- Plan § 6 (`sonde-post-deploiement-2026-09-11.json`) : 3 ✅ outil `calculCoutEmployeur` appelé avec `{ brut: 2800 }` ;
  6 ✅ maintien conventionnel sans IDCC → refus utile, aucun code technique ; 5 ✅ recherche web → 8 sources ;
  4 ❌ mode Claude explicite → « tools.8.custom.input_schema does not support oneOf, allOf, or anyOf at the top level »
  (`runMaintienSalaireTool`, préexistant) ; 7 ❌ aucune ligne RGDU (catégorie `RGDU` ≠ `RGDU (ex-Fillon)`, préexistant) ;
  8 ✅ journaux 100 % europe-west1 ; 9 — contrôle de santé quotidien non lisible sans secret de cron (à lire au prochain run).
- **Correctif PR #378** (`fix/ia-europe-post-deploiement`) : adaptation des schémas d'outils pour Claude
  (`src/library/ai/anthropic-tool-schema.js`) — vérifié en local avec la vraie clé : Claude Sonnet 4.5 `streamRawPredict`
  200, réponse produite (`sonde-local-vertex-hotfix-claude-2026-09-11.json`) ; mapping `RGDU` + `Net imposable` ; 4 tests.
  Le montant de référence (629,40 €) reste à mesurer en production après mise en ligne.
- **PR #379** (pages légales, registre, DPA) : rendu vérifié sur la Preview Vercel (commit `a1ae77cda`) — les cinq
  pages répondent 200, citent Google Cloud France / `europe-west1`, aucune formulation interdite, date du 11 septembre 2026.
- Hors périmètre, à ouvrir séparément : report de congés 30 j au lieu de 5 (préexistant) ; `[Quota] Increment error:
  supabase.raw is not a function` à chaque message du chat (préexistant, avril 2026).

## 8. `juriste-paie` — relecture finale des textes appliqués (PR #379, 11/09 ~20h30)

**Verdict : NO-GO**, non sur les pages (six corrections v1 sur sept fidèlement appliquées) mais sur la cohérence du reste du
produit et une citation contractuelle. Traitement (commit suivant) :

| # | Constat | Traitement |
|---|---|---|
| 1-3 | Bandeau « Conformité RGPD » de l Agent Paie (`AgentSecurityBanner.js`) : « IA opérée en interne, sans service tiers », modale « intégralement sur notre infrastructure… sans appel à Google » | **Corrigé** avec ses textes (« Données en France, IA exécutée en Union européenne » ; Google Cloud France, Belgique). |
| 4 | Page partenaire OpenPaye « IA opérée en interne » | **Corrigé**. |
| 5 | `POLITIQUE_CONFIDENTIALITE.md` (racine) : souveraine, aucun transfert hors UE, pseudonymisation | **Corrigé**, aligné sur la page. |
| 6 | `AIPD_ASSISTANT_IA.md` : conclusion fondée sur des prémisses fausses ; renvoi contractuel depuis l Annexe 1 du DPA | **Marquée obsolète** en tête (v2.0 à produire : R4, art. 36) ; ligne AIPD de l Annexe 1 → « incombe au Client, SDP l assiste ». |
| 7 | Phrase « encadré par les clauses contractuelles types » : avec une entité française, l exportateur est Google, et le CDPA prévoit CCT **ou** solution de transfert alternative ; « § 4.1 » cité sans lecture intégrale | **Remplacée** par sa formulation dans les 7 emplacements ; « § 4.1 » retiré partout ; `sources-officielles.md` § 8 rendu cohérent. |
| 8 | Notification : entité irlandaise, 60 jours (le contrat dit 30), retrait de la pseudonymisation non dit, formulée en préavis alors que la bascule est faite | **Réécrite (v3)** : Google Cloud France, 30 jours (art. 3.4 / 6), retrait de l engagement dit, information sur un changement intervenu. Toujours NON envoyée. |
| 9 | Entité contractante réelle du compte GCP | **Rose** : première facture. Règle générale vérifiée (tableau Google + SIRENE : Google Cloud France SARL, 8 rue de Londres, 75009 Paris, SIREN 881 721 583). |
| 10-14 | Registre L5 (« Représentante légale »), conservation côté IA en S-003, identification SARL/SIREN dans les annexes, URL `/legal/sous-traitants` sur `www.smartdatapay.app`, version et date du DPA md | **Corrigés**. |
| 15-16 | Brouillons v2 encore « EMEA / Irlande » ; § 8 des sources contredisait § 10 | **Corrigés** (brouillons v3, sources). |
| — | Trouvé en plus, hors de sa liste : le **contrat PDF de souscription** (`src/library/contracts/pdf-generator.js`, signé par chaque nouveau client) portait « Souveraineté des données », « Architecture souveraine », « Pseudonymisation automatique » | **Corrigé** (art. 7.2, 8.1-8.3, sans accents comme le reste du générateur). |
| — | Version du DPA : sa recommandation = incrémenter en 1.1 même sans re-signature (identifie le texte ; retirer un engagement de sécurité de l annexe rend « non substantiel » difficile à tenir) | **1.1** posée dans `dpa.js` et la page ; aucun mécanisme n impose de re-acceptation aux clients existants (acceptation recueillie à la souscription) → exiger ou non une nouvelle acceptation reste la décision de Rose. |

Signalé à Rose, hors périmètre IA : délai de notification de violation **24 h** (DPA md, pages rgpd/confidentialité) contre
**72 h** (page DPA art. 4 f et 10) — préexistant, le client peut invoquer le plus favorable ; la liste des sous-traitants de
Google n a pas été lue (« aucun sous-traitant hors UE » vaut au premier rang) ; le site vitrine (dépôt séparé) échappe à cette
relecture. Preuve prod de Claude : hors journaux www (le contrôle de paie de la sonde n a pas appelé le vérificateur) → à
compléter après la mise en ligne du correctif #378 (mode Claude explicite).

## 9. `juriste-paie` — contre-relecture (11/09 ~21h30) sur `7542c12a6`

**Verdict : NO-GO**, deux points bloquants, 14 des 16 points précédents confirmés corrigés. Traitement dans `9f2155985` :

| # | Constat | Traitement |
|---|---|---|
| B1 | « Aucun sous-traitant établi hors UE » est **faux** : le juriste a lu les DPA publics — Supabase Pte. Ltd. (Singapour), Vercel, Inc., Plus Five Five, Inc. (Resend) et Functional Software, Inc. (Sentry) (États-Unis), tous sous clauses contractuelles types. Présent dans l'art. 4 h du DPA (obligation contractuelle), le contrat PDF signé à la souscription, la page sous-traitants, POLITIQUE md, CONFORMITE, le registre, l'Annexe 3 du DPA md. | **Corrigé partout** : tableaux à colonnes « Localisation des données » / « Société et garantie » (entité contractante + instrument) ; art. 4 h réécrit avec son texte (traitements exécutés dans l'UE + garanties du chapitre V pour tout accès depuis un pays tiers) ; paragraphe de remplacement posé (page, CONFORMITE § 8, POLITIQUE § 4, DPA md Annexes 2-3, contrat PDF art. 7.2) ; registre : rubrique Transferts de **tous** les traitements (Supabase/Vercel nommés). Réserve du juriste maintenue : DPA publics lus, contrats souscrits non lus → **Rose confirme sur ses contrats**. |
| B2 | Trois survivances « encadré par les clauses contractuelles types » (page DPA art. 4 h, CONFORMITE § 7, DPA md Annexe 2). | **Retirées**. |
| C1-C10 | Bandeau « jamais hors UE » ; POLITIQUE md daté 18 avril, numérotation 1-2-5, « Hébergement en France » nu ; contrat PDF « Ex?cution » et « ? Training ? » (déduit de `escapePdfString`), phrase tronquée ; registre S-003 sans version du CDPA ; CONFORMITE § 14 « aucun » ; coquille brouillons. | **Corrigés** ; générateur exécuté : plus aucun « ? » (mesuré). |
| Signalés | 24 h (DPA md, pages rgpd/confidentialité, contrat PDF) vs 72 h (page DPA art. 4 f et 10) ; DPA md art. 9.1 (avenant signé, modification unilatérale sans effet) vs page art. 15 (évolution unilatérale) ; `pseudonymize.js` code mort ; adresses support .app/.com incohérentes dans le contrat PDF. | **Non traités** (préexistants, décisions de Rose) — listés dans la passation. |
| Version | Sa phrase pour Rose : « La version 1.1 est-elle une modification substantielle au sens de l'art. 15 — notification 30 j **et** nouvelle acceptation en ligne (aucun écran ne la demande aujourd'hui ; la route GET `/api/legal/dpa/accept` sait déjà comparer) — ou Rose assume-t-elle par écrit qu'elle ne l'est pas ? » Son avis : retrait d'un engagement de sécurité + ajout d'un sous-traitant = difficile à qualifier de non substantiel. | Commentaire de `dpa.js` mis en cohérence (il promettait une re-signature que rien ne déclenche). **Décision de Rose.** |

Rendu vérifié sur la Preview Vercel (commit `9f2155985`, en-tête de contournement de la protection) : cinq pages 200, tableau
« Société et garantie » présent, zéro « aucun sous-traitant établi », zéro formulation interdite. Troisième relecture ciblée lancée.

## 10. `juriste-paie` — troisième, quatrième et cinquième passes (11/09, 22h-23h)

- **3e passe** (sur `9f2155985`) : NO-GO ciblé — Resend stocke journaux et métadonnées d'envoi aux États-Unis (doc « Regions »,
  DPA § 6.1) ; Stripe transfère vers Stripe, LLC (CCT + DPF) ; registre R-002/R-003/R-005 sans leur prestataire propre ; en-tête
  de colonne. Non bloquants : clause « 60 jours » résiduelle du DPA md, doublon Google, absolu « 100 % UE », **aucune purge à 90
  jours n'existe** (vérifié : 21 crons, une seule suppression manuelle) alors que cinq textes la promettaient. → `4ac4bcaf1`, `23850e539`.
- **4e passe** (sur `23850e539`) : NO-GO ciblé — survivance « 90 jours » (CONFORMITE § 6), « purge automatique » (CONFORMITE § 2,
  POLITIQUE md), journaux Resend absents de la page confidentialité, mentions légales non datées, **24 h / 72 h** : art. 33.2
  n'impose aucun délai chiffré au sous-traitant, 72 h est le délai du client vis-à-vis de la CNIL → page DPA alignée sur les
  24 h déjà promises par le contrat signé et sept autres textes. Formule de durée retenue : « Conservé pendant la durée du
  compte — supprimé avec le compte, et à tout moment par l'utilisateur » (critère art. 13.2.a ; pas de chiffre sans cron). → `55b0c430b`.
- **5e passe** (sur `55b0c430b`) : **GO pour la publication**. R-1 à R-5 confirmés ligne à ligne ; formule de durée sur les six
  surfaces ; aucune revendication résiduelle de purge automatique des conversations ; « 72 heures » correctement cantonné à la
  notification CNIL par le responsable. Deux formulations perfectibles appliquées ensuite : cantonnement écrit du point 5 de
  CONFORMITE § 12 ; « plus strict que les 72 h légales » → « délai contractuel de 24 heures ; l'art. 33.2 n'exige que les
  meilleurs délais » (CONFORMITE, PROCEDURE, page rgpd, contrat PDF) ; accountability § 2 : AIPD « en cours de refonte ».

**Restent à Rose (liste fermée du juriste)** : 1. région Resend du domaine d'envoi (la page dit « journaux aux États-Unis » ;
si le domaine n'est pas en `eu-west-1`, écrire « envoi et stockage aux États-Unis ») ; 2. DPA 1.1 : modification substantielle
(notification 30 j + nouvelle acceptation, aucun écran ne la demande) ou position écrite ; 3. AIPD v2 sur les prémisses réelles ;
4. archiver les DPA souscrits et confirmer les entités contractantes ; 5. DPA md art. 9.1 (avenant signé) vs page art. 15
(évolution unilatérale) : un seul régime doit survivre ; 6. anonymisation des journaux à 6 mois (CONFORMITE § 6) : aucun cron
trouvé, exécution non prouvée. Hors chantier : exemption anti-abus Google, entité Google sur la première facture.

## 11. Train du 12/09 (go de Rose « go train ») — preuve en production

Fusion #378 (`ee7a6c3a0`) puis #379 (`2171a3bd8`) ; `mettre-en-ligne-master.mjs` : 5/5 URL directe → promotion → 5/5 www.
Sondes www : 7 routes IA en 200 ; plan § 6 **8/8** : outil typé nombre ✅, refus sans jargon ✅, **mode Claude 200 ✅** (corrigé),
recherche web 8 sources ✅, **RGDU 0,3147 / 629,40 € ok ✅, effectif 120 → 0,3178 / 635,60 € ✅, ligne 500 € → attention −129,40 € ✅**
(corrigé ; prévisions de l'expert paie confirmées au centime), journaux **60 traces 100 % europe-west1, 0 refus**, Claude Sonnet 4.5
désormais visible en production (`streamRawPredict` 200 ×4). Six pages légales servies (200, Google Cloud France, Singapour, DPA 1.1,
datées du 11/09/2026, aucune formulation interdite). Fichiers : `sonde-prod-2026-09-12.json`, `sonde-post-deploiement-2026-09-12.json`,
`traces-prod-www-2026-09-12.json`.
