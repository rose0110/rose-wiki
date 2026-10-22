# Chantier — IA en Europe : que « hébergé en France » soit vrai aussi pour l'IA

Écrit le 11/09/2026, pour Fable 5.1 (ou Opus 5).

> Lis le fichier `PROMPT-CHANTIER-IA-EN-EUROPE.md` et exécute tout ce qui est sous la ligne de
> séparation comme ton objectif. Suis-le exactement, y compris la règle « ne me demande rien »
> — à une exception près, écrite dans les points d'arrêt : les éléments que seule Rose peut créer.
> Ne me fais aucun rapport avant que la définition de « terminé » soit atteinte. Commence maintenant.

---

## LA CIBLE

Aujourd'hui les pages publiques de Smart Data Pay promettent « aucun transfert de données hors
Union européenne », « sans recours à un service d'IA tiers, notamment OpenAI, Anthropic, Google »,
« infrastructure IA souveraine ». Le DPA signé avec les cabinets porte ces engagements. **C'est
faux** : la base et l'application sont bien à Paris, mais chaque appel d'IA part chez Google,
Anthropic, OpenAI ou Perplexity aux États-Unis, avec dedans des bulletins, des DSN, des noms, des
numéros de sécurité sociale. La bascule vers Vertex AI en Europe, validée par Rose le 9 août et
fusionnée le 12 août, n'a jamais été activée en production et ne couvrait qu'une route.

À la fin de ce chantier :

1. **Tout appel d'IA de l'application sort par un seul point**, `src/library/ai/gateway.js`, et
   ce point ne connaît que des terminaux **en Union européenne**. Un fichier qui importe un
   fournisseur directement ne passe pas la CI.
2. **En production, la preuve est faite** : chaque hôte contacté par l'IA est un terminal
   européen, mesuré, pas déduit. Le chat, l'Agent Paie, le contrôle de paie, la recherche dans
   les documents d'un projet, la génération de documents, la synthèse vocale et le générateur de
   CV fonctionnent comme avant, ou mieux.
3. **Les pages légales disent le vrai**, ni plus ni moins : `/legal/dpa`, `/legal/rgpd`,
   `/legal/sous-traitants`, et le `REGISTRE_RGPD.md` nomment les sous-traitants réels, leur
   région, et la nature des données qui y transitent. Elles ne sont modifiées **qu'après** la
   preuve du point 2, jamais avant.
4. **Andy peut dire sur le stand** : « vos données sont hébergées en France, et l'IA qui les lit
   tourne en Europe ». Chaque mot de cette phrase est prouvé.

Je ne répondrai à aucune question de conception. Tranche toi-même, écris pourquoi. Critère
unique : ça fonctionne, et chaque phrase publique est vraie.

## COORDINATION AUTOMATIQUE (à faire en premier, sans rien demander à Rose)

D'autres chantiers peuvent tourner en parallèle sur ce dépôt. Rose lance quand elle veut ; c'est
à toi de te coordonner, jamais à elle.

1. Avant de créer ton worktree : `gh pr list --state open` et `git ls-remote --heads origin`.
   Repère les branches et PR des chantiers voisins : Rouvrir le chat (branche ou PR contenant « rouvrir » ou « chat » : route chat unique et `src/library/chat/*`), Aucun jargon à l’écran (branche contenant « jargon » : textes des fichiers du chat et des routes API).
2. Pour chaque voisin trouvé et non fusionné : lis sa PR ou son prompt-chantier, note les
   fichiers qu'il touche, et **ne modifie pas ces fichiers-là** tant qu'il n'est pas fusionné ;
   fais tout le reste. Si aucune trace d'un voisin n'existe, il n'a pas été lancé : tu ne l'attends
   pas, tu fais ce que ton propre périmètre exige, y compris sur ses fichiers.
3. Avant d'ouvrir ta PR : `git fetch origin master`, rebase, rejoue le juge et les suites sur
   l'état fusionné. Si un voisin a été fusionné entre-temps, intègre-le et termine ce que tu avais
   laissé de côté.
4. Ce que tu n'as pas pu finir à cause d'un voisin est écrit dans `PROJECT-HANDOFF.md`, avec
   la raison. Aucune question d'ordre ou de priorité à Rose : tu tranches, tu écris pourquoi.

## LE JUGE

**Le juge, c'est quatre contrôles, tous verts :**

1. `node --test tests/ia-europe/*.test.js` — **n'existe pas, le construire est ta première
   tâche.** Il prouve, sans réseau :
   - qu'aucun fichier de `src/` hors `src/library/ai/gateway.js` n'importe `@ai-sdk/google`,
     `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google-vertex`, ni ne contient
     `api.anthropic.com`, `generativelanguage.googleapis.com`, `api.openai.com`,
     `api.perplexity.ai` (analyse statique, liste blanche fermée : la seule exception autorisée
     est le fichier gateway) ;
   - que la passerelle **refuse de démarrer** si les variables Vertex sont absentes en production
     (`VERCEL_ENV=production`) au lieu de retomber en silence sur un terminal américain : c'est le
     défaut qui a laissé la promesse fausse pendant un mois ;
   - que chaque terminal construit par la passerelle a un hôte de la forme
     `<region-ue>-aiplatform.googleapis.com` avec une région commençant par `europe-`, pour les
     modèles de texte, les modèles Claude et les embeddings.
2. **Garde réseau à l'exécution** : sur le modèle de
   `tests/ccn-c09-financial/network-guard.test.mjs` (préchargeur qui intercepte DNS et
   connexions sortantes), un test qui exerce réellement les routes IA en local avec des
   variables de test et **échoue à la première connexion vers un hôte hors liste blanche
   européenne**. C'est lui qui mesure, pas un grep.
3. `npm run test:ccn-c09 && npm run test:ai-budget && npm run test:controles` — la frontière
   C09, le budget IA et le contrôle de paie ne régressent pas.
4. **Preuve en production** : sur `www.smartdatapay.app`, avec le compte
   `e2e-tests@smartdatapay.app`, jouer chat, Agent Paie, contrôle de paie avec une DSN de test,
   recherche dans un document de projet, génération d'un courrier, synthèse vocale, et lire dans
   les journaux Vercel (ou une trace ajoutée à la passerelle, sans donnée personnelle) l'hôte
   contacté à chaque appel. **Aucun hôte hors `europe-`.** Sortie brute dans le récap.

**La référence, c'est l'état du 11/09 mesuré avant tout changement** : quelles routes IA marchent
en production, avec quels hôtes (les clés Anthropic et Google de production étaient mortes le
9 août, 401 et 400 ; vérifie ce qui marche vraiment aujourd'hui, ne suppose rien).

## LES FAITS DURS

**Inventaire du 11/09 (grep sur `src/`, hors tests) :**
- Fournisseurs importés directement : `@ai-sdk/google` dans 7 fichiers, `@ai-sdk/anthropic` 2,
  `@ai-sdk/openai` 2 (`src/app/api/generate-resume/route.js`, `src/app/api/text-to-speech/route.js`),
  `@ai-sdk/google-vertex` 1 (`src/library/controles/source-ia.js`, seule route à avoir la
  branche Vertex, ligne 37, activée par `GOOGLE_VERTEX_PROJECT` + `GOOGLE_VERTEX_CLIENT_EMAIL` +
  `GOOGLE_VERTEX_PRIVATE_KEY` + `GOOGLE_VERTEX_LOCATION`), `api.anthropic.com` 1, Perplexity 2
  (`src/app/api/alerts/not-found/route.js`, `src/library/ccn/c11/zero-external-ai.js`).
- Modèles : `gemini-2.5-flash` (31 occurrences), `gemini-2.5-pro` (11), `claude-sonnet-4-5`
  (6, dont `claude-sonnet-4-5-20250929`), `gemini-embedding-001` (5), `gpt-4-turbo` et
  `gpt-3.5-turbo` (générateur de CV), `gpt-4o-mini-tts` (synthèse vocale), Perplexity `sonar`
  (recherche web).
- **Embeddings** : `src/library/agent/rag.js`, `src/library/ai.js`, `src/library/chat/legal-tools.js`,
  `src/library/constants.js` (`gemini-embedding-001`, `text-embedding-004`, `text-embedding-3-*`).
  ⚠️ Changer de modèle d'embedding rend **tous les vecteurs existants incomparables** : les
  documents de projets (`agent_document_chunks`) et la base de connaissances légale doivent être
  ré-indexés, avec un plan de migration (ancienne et nouvelle colonne, bascule, purge) et une
  preuve que la recherche rend les mêmes résultats sur un jeu de questions de référence. Si le
  même modèle existe sur Vertex Europe, garde-le : c'est le chemin sans ré-indexation.
- Une couche IA partielle existe déjà : `src/library/ai/` (`budget.js`, `ledger.js`, `meter.js`,
  `pricing.js`, `pseudonymize.js`, `require-ai-access.js`, `usage-normalize.js`). La passerelle
  s'y ajoute et **tout ce qui compte les coûts continue de compter** (mémoire
  `project_facture_ia_2000e_garde_fous` : plafonds actifs, ne jamais les désactiver).
- Variables en production (projet Vercel `smartdatapay-ai`, noms seulement, vus le 11/09) :
  `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENAI_API_KEY`,
  `PERPLEXITY_API_KEY` ; **aucune** `GOOGLE_VERTEX_*`. Le code lit aussi `ANTHROPIC_KEY`.
- Base Supabase : Paris (`eu-west-3`). Application : Vercel Paris (`cdg1`). Ces deux-là sont
  déjà vrais.
- Pages à corriger après preuve : `src/app/(public)/legal/dpa/page.js`,
  `src/app/(public)/legal/rgpd/page.js`, `src/app/(public)/legal/sous-traitants/page.js`,
  `REGISTRE_RGPD.md`, et la note `docs/rgpd-ia-controle-paie.md`. Le DPA promet aussi une
  « pseudonymisation avant toute inférence IA » que le pipeline ne fait pas partout :
  `src/library/ai/pseudonymize.js` existe, vérifie où il est appliqué, et soit tu l'appliques
  partout où des données de salariés partent, soit la phrase du DPA est retirée. Pas de troisième
  voie.

**Décisions déjà prises, à ne pas rediscuter :**
- Option 2 validée par Rose le 9 août : **Vertex AI, région Union européenne**, Gemini 2.5 Flash
  primaire, Claude Sonnet 4.5 via Vertex en vérificateur. Le masquage systématique (option A)
  n'a pas été retenu comme substitut, mais la pseudonymisation promise par le DPA doit être
  tranchée comme dit ci-dessus.
- **Ce qui n'a pas d'équivalent européen prouvé se retire**, il ne reste pas « en attendant » :
  Perplexity (la recherche web) et OpenAI (CV, synthèse vocale) sont remplacés par un modèle
  servi en Europe ou retirés du produit avec un message clair à l'utilisateur. Vérifie à la source
  (documentation officielle du jour, pas ta mémoire) la disponibilité de chaque modèle par région
  Vertex européenne, y compris Claude et l'embedding, et cite la page consultée avec sa date.
- **Aucune variable de projet Vercel pour le SHA** (règle du skill `deploy-vercel-sur`) ; les
  variables Vertex, elles, sont des variables de projet, scope Production ET Preview, valeurs
  chiffrées, jamais dans le dépôt, jamais dans un journal.

**Ce que ce chantier ne fait pas :** il ne change ni les prompts métier, ni la frontière C09, ni
les budgets IA, ni les modèles choisis au-delà de leur région. Il ne touche pas au site vitrine
(`smart-data-pay-site`, chantier à part) : il lui fournit la phrase vraie à écrire.

**Matrice de livraison (verrou full-stack) :**

| Livrable utilisateur | Dépôt exact | Route ou écran | Profil concerné | Preuve attendue |
|---|---|---|---|---|
| Chat / Agent Paie répondent via l'Europe | smartdatapay-app | route chat unique | Premium / essai | trace d'hôte en prod |
| Contrôle de paie (DSN, bulletin) | smartdatapay-app | `/api/controles/*` | Premium | trace d'hôte + résultat identique sur DSN de test |
| Recherche dans les documents d'un projet | smartdatapay-app | RAG projet | Premium | mêmes résultats sur jeu de référence |
| Génération de documents | smartdatapay-app | `/api/documents/*`, smart-documents | Premium | parcours réel |
| Synthèse vocale, générateur de CV | smartdatapay-app | leurs routes | tous | fonctionnent via l'Europe ou retirés proprement |
| Pages légales vraies | smartdatapay-app | `/legal/dpa`, `/legal/rgpd`, `/legal/sous-traitants` | visiteurs, clients B2B | texte relu + capture |
| Registre RGPD à jour | smartdatapay-app | `REGISTRE_RGPD.md` | Rose | diff relu |

## GARDE-FOUS ET POINTS D'ARRÊT

- **Ce que seule Rose peut faire, et où tu t'arrêtes pour le lui demander, une seule fois, avec
  la liste complète et les clics exacts** : créer le projet Google Cloud dans une région
  européenne avec son compte de facturation ; activer l'API Vertex AI ; demander l'accès aux
  modèles Claude dans le Model Garden ; créer le compte de service (droit minimal : utilisateur
  Vertex AI) et te remettre sa clé, ou mieux, si Vercel le permet le jour du chantier, une
  fédération d'identité sans clé longue durée, à vérifier à la source. **Avant de t'arrêter, fais
  tout ce qui n'en dépend pas** : la passerelle, les tests, la garde réseau, l'inventaire de
  départ, les brouillons de pages légales. Quand elle te donne les valeurs, tu les poses toi-même
  dans Vercel (Production et Preview) par l'API, tu ne les colles nulle part ailleurs.
- **Jamais de repli silencieux.** Si Vertex Europe est injoignable, la route répond une erreur
  claire à l'utilisateur et une alerte part vers Rose (vigie existante). Elle ne retombe pas
  sur un terminal américain « pour que ça marche ».
- **Worktree isolé depuis `origin/master`**, branche dédiée, PR, CI. Les rouges permanents de
  master (secrets versionnés, cartographie, tests alertes 24 et 89, prévol C12) ne sont pas de
  ton lot : prouve par `git diff --name-only origin/master -- <fichier>` que tu ne les aggraves pas.
- **Verdicts écrits avant le train** : `securite-rgpd` (aucune donnée personnelle dans les traces
  d'hôte, variables chiffrées, pseudonymisation tranchée), `testeur-qa` (parcours réel de chaque
  route IA avant/après, résultats identiques), `juriste-paie` (relecture des textes DPA,
  sous-traitants, registre : rien de promis au-delà du prouvé), `expert-paie` (le contrôle de
  paie rend le même verdict sur la DSN de test).
- **Déploiement** : mandat de Rose du 8 septembre. Preview Vercel avec les variables Vertex de
  Preview, verdicts, puis mise en ligne via `deploy-vercel-sur`, preuve en prod (point 4 du
  juge), rollback immédiat si un hôte hors Europe apparaît ou si une route IA casse.
- **Les clients ayant signé le DPA** : si le texte du DPA change, la notification aux clients
  est **une décision de Rose**, pas la tienne. Tu prépares le texte de la notification et la
  liste des clients concernés, tu ne l'envoies pas.
- **Jamais en autonomie** : un envoi à un client, une modification de facturation Google, une
  suppression de clé.

## LES RESSOURCES

Agents : `securite-rgpd`, `testeur-qa`, `juriste-paie`, `expert-paie`, `Explore`, `arbitre`
(si un choix de région ou de modèle oppose disponibilité et conformité). Skills :
`deploy-vercel-sur`, `vigie`, `routage`, `vercel:ai-sdk`, `vercel:env`. Mémoire :
`project_rgpd_ia_controle_paie` (décision du 9 août et PR #226), `project_rgpd_ia_etat_reel_20260911`
(état mesuré), `project_facture_ia_2000e_garde_fous` (plafonds), `project_vercel_token` (API
Vercel, projet `smartdatapay-ai`, jamais le projet homonyme dormant). Tu as le droit de lancer un
agent adverse qui tente de faire sortir un appel IA par un autre chemin que la passerelle.

## CE QUE JE VEUX TROUVER À LA FIN

- La suite `tests/ia-europe/` et la garde réseau, avec la sortie brute des quatre contrôles.
- L'inventaire avant/après : chaque route IA, son fournisseur, son modèle, son hôte, en
  production, mesurés.
- La liste exacte de ce que Rose a dû faire, et quand elle l'a fait.
- Les pages légales et le registre corrigés, avec le diff relu par `juriste-paie`, et le texte de
  notification aux clients prêt mais non envoyé.
- Le plan de ré-indexation des embeddings s'il a fallu changer de modèle, avec sa preuve.
- La phrase exacte qu'Andy peut dire sur le stand, et rien de plus.
- Un récap HTML sous `docs/chantier/preuves/ia-en-europe/`, rejouable, qui distingue partout
  **mesuré / déduit / non vérifié**, et la mise à jour de `PROJECT-HANDOFF.md`.

## CLÔTURE

Je ne veux ni prototype, ni « première version qu'on affinera ». Au bout de ce chantier il y a un
DPA signé par des cabinets qui ont cru une phrase fausse, et une salle de congrès devant laquelle
Rose dira « hébergé en France » sous son nom. Je veux une passerelle que tu as construite,
attaquée, cassée et relancée jusqu'à ce qu'aucun appel ne sorte d'Europe, mesuré en production et
pas déduit d'un fichier, et des pages légales que je peux mettre devant un délégué à la protection
des données demain matin sans le prévenir de quoi que ce soit. Un hôte hors Europe se dit, il ne
se tolère pas « en attendant ».
