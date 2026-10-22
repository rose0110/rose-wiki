# Le juge : quatre vérifications, et le dossier de preuves

Un chantier IA en Europe est « terminé » quand les quatre juges sont verts **et** que la preuve prod est
archivée. « J'ai écrit le code » ne compte pas ; « la sonde prod montre 200 et les journaux ne montrent
que `europe-west1` » compte.

## Juge 1 — Frontière statique (`assets/tests/frontiere-statique.test.js`)

Lit tout `src/` et vérifie :
- aucun fichier hors la passerelle n'importe un paquet fournisseur (liste fermée : `@ai-sdk/openai`,
  `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/google-vertex`, `@ai-sdk/perplexity`, `openai`,
  `@anthropic-ai/sdk`, `@google/generative-ai`, `@google-cloud/vertexai`, `tavily`…) ;
- aucun fichier ne contient un hôte de fournisseur (passerelle comprise : elle **construit** l'hôte à
  partir de la région, elle ne le connaît pas en clair) ;
- la passerelle n'importe que Vertex (Google + Anthropic sur Vertex) et l'authentification Google ;
- elle ne connaît aucun hôte global ni multi-région, seulement le motif `europe-*` ;
- elle est le seul fichier à appeler `createVertex*` ;
- les anciens points de sortie sont supprimés ;
- le **pont CLI** (`spawn('claude', …)`, invisible pour la règle des imports) n'a aucun importeur et
  personne d'autre ne lance le CLI. Vérifier que la garde attrape un fichier témoin avant de la déclarer utile.

Piège : un commentaire qui cite `api.tavily.com` fait échouer le test — reformuler (« un service de
recherche américain »).

## Juge 2 — Configuration sans réseau (`assets/tests/passerelle-config.test.js`)

Sans clé, sans réseau : refus si variables absentes (prod **et** local), régions non-UE refusées à la
lecture, hôte par capacité (texte, Claude, embeddings, voix, recherche), `tracedFetch` refuse avant
émission (on observe zéro requête), trace sans donnée personnelle, sémantique du jeton de test, express
mode neutralisé, enveloppe WAV correcte. Les fausses clés s'écrivent `['cle-de-test','ligne-2'].join('\n')`
pour ne pas déclencher le scanner de secrets du dépôt.

## Juge 3 — Garde réseau à l'exécution (`assets/tests/garde-reseau-preload.cjs` + `garde-reseau.test.mjs`)

Un **préchargeur** (`node --require garde-reseau-preload.cjs`) intercepte `dns`, `net`, `tls`, `http`,
`https`, `http2` et `fetch` ; liste blanche `^europe-[a-z0-9]+-aiplatform\.googleapis\.com$` +
`oauth2.googleapis.com` ; tout autre hôte lève et est consigné. Deux sondes :
- `probes/passerelle.mjs` : la passerelle avec un jeton de test tente Gemini, Claude, embeddings, voix,
  recherche → toutes les émissions vont vers `europe-*` (le 401 du jeton factice prouve l'émission) ;
- `probes/contournement.mjs` : un code adverse tente `api.openai.com`, `api.anthropic.com`,
  `generativelanguage.googleapis.com`, `us-central1-aiplatform…`, l'hôte global → tous **refusés**.

Version bout en bout (`assets/scripts/garde-reseau-serveur.mjs`) : le serveur de développement entier
sous préchargeur en mode `SDP_GARDE_MODE=dev` (liste blanche élargie à Supabase, polices, Sentry, npm) ;
on joue les vraies routes ; on lit les cibles réseau observées. Chez SDP : 267 cibles, **un seul hôte IA**,
0 refus, Gemini et Claude exercés.

Mesure complémentaire avec la vraie clé : `verifier-acces-vertex.mjs` (6/6) puis
`verifier-capacites-avancees.mjs` (embedMany 50, sources web, Claude + outil + thinking, Gemini Pro + outil).

## Juge 4 — Non-régression du projet, puis preuve en production

- Suites du projet qui touchent l'IA (SDP : `test:ccn-c09`, `test:ai-budget`, `test:controles`,
  `test:agent-guard`, `test:alertes`, scanner de secrets, audit des émetteurs d'alerte). Les rouges CI
  **permanents** doivent être prouvés identiques sur `master` et sur la PR précédente avant d'être ignorés.
- **Preuve prod** (après mise en ligne par la procédure du projet) : `sonde-routes-ia.mjs` contre le
  domaine public avec le compte de test → chaque route ≥ « avant » ; `vercel logs <domaine> --json` →
  lignes `[ai-gateway]` toutes en `europe-*`, zéro `refused` ; archiver les traces (sans contenu).
- **Plan post-déploiement** (`sonde-post-deploiement.mjs`, issu des verdicts QA/paie) : outil de calcul
  appelé avec un nombre typé ; refus d'un cas incomplet **sans jargon** ; recherche web avec sources ;
  mode Claude explicite ; bulletin de référence du contrôle de paie (2 000 € / 151,67 h / effectif < 50 →
  réduction générale 629,40 €, coefficient 0,3147 ; effectif ≥ 50 → 635,60 €). C'est ce plan qui a trouvé,
  le 11/09, deux défauts préexistants (schéma `allOf` refusé par Anthropic ; ligne RGDU filtrée par un
  libellé de catégorie différent).
- Rollback : correctif au-dessus du dernier HEAD par la même procédure ; jamais réassigner un ancien
  déploiement (règle « arbitre de fraîcheur »).

## Le dossier de preuves (`docs/chantier/preuves/ia-en-europe/`)

| Fichier | Contenu |
|---|---|
| `recap.html` | Récap lisible par Rose : cible, référence AVANT, construit, juge (sorties brutes), disponibilité par région, décisions, verdicts, ce que Rose a fait, phrase d'Andy, comment rejouer. Chaque affirmation étiquetée **mesuré / déduit / non vérifié**. Modèle : `assets/preuves-exemple/recap-exemple.html`. |
| `inventaire-routes-ia.md` | Avant/après par fichier et par route. |
| `sources-officielles.md` | Chaque page Google/Anthropic lue, avec date de modification et citation. Ce qui n'a PAS été lu. |
| `brouillons-textes-legaux.md` | Textes v1 → v2 après juriste, tableau des corrections, notification, phrase de stand, checklist. |
| `verdicts.md` | Un paragraphe par agent : ce qu'il a MESURÉ, ses constats, le traitement de chacun. |
| `sonde-avant-*.json`, `sonde-prod-*.json`, `traces-prod-*.json`, `verification-*.json`, `garde-reseau-*.json` | Sorties brutes, extraits courts, aucune donnée réelle (compte de test, bulletins synthétiques). |

Plus `PROJECT-HANDOFF.md` à la racine (passation Codex ↔ Claude) et la mémoire persistante du projet.

## Les verdicts (avant tout déploiement)

Lancer les agents en parallèle, avec le diff, les preuves et des questions précises :
- **`securite-rgpd`** — cherche à faire fuiter : `err.message` (sortie du modèle, IAM), express mode,
  jeton de test en prod, surface publique de la passerelle, erreur de région en 500 au lieu de 503,
  secrets fictifs détectés. Chez SDP : NO-GO puis 11 corrections.
- **`juriste-paie`** — textes : jamais « aucun transfert hors UE » ; conservation anti-abus 30 j ;
  entraînement sourcé (SST § 18) ; Anthropic non ajouté comme sous-traitant faute de source ; registre
  art. 30.2 ; préavis 60 j ; version du DPA. Chez SDP : NO-GO v1 → v2.
- **`testeur-qa`** — parcours réels, réfute les hypothèses : ses constats **déduits** se mesurent avant
  d'être crus (le « lot de 50 embeddings refusé » était faux) ; ses constats mineurs (codes à l'écran,
  `try` mal placé, accents) se corrigent dans l'heure.
- **`expert-paie`** — justesse au centime : le moteur déterministe doit être **hors du diff** ; fournit
  le bulletin de référence à rejouer en prod ; peut découvrir des défauts préexistants (report de congés
  30 j au lieu de 5) qu'on **note** hors périmètre sans les cacher.

Écrire chaque verdict dans `verdicts.md` et en commentaire de la PR ; un NO-GO retire la PR du train.
