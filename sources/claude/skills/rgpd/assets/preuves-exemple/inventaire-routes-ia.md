# Inventaire des appels d'IA de l'application — avant / après (chantier « IA en Europe »)

Statut de chaque ligne : **mesuré** (observé par un outil), **déduit** (lu dans le code), **non vérifié**.

Référence : `origin/master` = `[HEX MASQUÉ]` (11/09/2026).

## 1. État de départ (11/09/2026, avant tout changement)

### 1.1 Production mesurée (sonde `scripts/ia-europe/sonde-routes-ia.mjs`, compte e2e-tests, fichier `sonde-avant-2026-09-11.json`)

| Route | Fournisseur / modèle (déduit du code) | Hôte contacté (déduit du code) | Résultat en prod (mesuré) |
|---|---|---|---|
| `POST /api/text-to-speech` | OpenAI `gpt-4o-mini-tts` | `api.openai.com` (États-Unis) | **HTTP 500** en 9,7 s (« La synthèse vocale a échoué ») — clé OpenAI morte |
| `POST /api/generate-resume` | OpenAI `gpt-4.1` | `api.openai.com` (États-Unis) | **HTTP 500** en 8,8 s — clé OpenAI morte |
| `POST /api/chat` | Google `gemini-2.5-pro` (SDK direct) | `generativelanguage.googleapis.com` (terminal global) | **HTTP 200**, réponse correcte en 9,3 s |
| `POST /api/agent/events` | Google `gemini-2.5-flash` (SDK direct) ; `claude-sonnet-4-5` via `api.anthropic.com` si demandé | `generativelanguage.googleapis.com` / `api.anthropic.com` | **HTTP 200**, réponse correcte en 1,9 s |
| `POST /api/agent/events` (outil rechercherDocuments) | embeddings `gemini-embedding-001` (SDK direct) | `generativelanguage.googleapis.com` | **HTTP 200** ; sans projet actif l'outil ne cherche pas (comportement produit, pas une panne) |
| `POST /api/controles/executer` | Claude `claude-sonnet-4-5-20250929` direct si `ANTHROPIC_KEY`, sinon Gemini direct ; vérificateur = l'autre éditeur | `api.anthropic.com` + `generativelanguage.googleapis.com` | **HTTP 422** en 1,8 s (« Impossible d'extraire les données ») — le modèle primaire (Claude, clé Anthropic morte depuis le 09/08) n'a rien rendu |
| `POST /api/conges-report/calculer` | Google `gemini-2.5-flash` (SDK `@google/generative-ai`) | `generativelanguage.googleapis.com` | **HTTP 200**, JSON correct en 38 s |
| `GET /api/user/me` (contrôle de session) | — | — | 404 : la route n'existe pas ; la session a été prouvée par les 200 des routes protégées |

Non sondées en prod (accès réservé ou multipart) : `/api/agenda/assistant` (admin seulement, Gemini direct), `/api/agent/documents` (upload + embeddings, Gemini direct), résumé de conversation (`conversation-summary.js`, Gemini direct, déclenché après 20 messages), audit des simulateurs (`simulator-audit.js`, Gemini direct), recherche web du chat (`search-tool.js`, Tavily `api.tavily.com`, États-Unis, si `TAVILY_API_KEY`).

### 1.2 Variables d'environnement de production (noms seulement, projet Vercel `smartdatapay-ai`, mesuré le 11/09)

`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENAI_API_KEY`, `PERPLEXITY_API_KEY` — **aucune** `GOOGLE_VERTEX_*`. La bascule Vertex de `source-ia.js` (PR #226) ne s'est donc jamais activée.

### 1.3 Fichiers de `src/` qui importaient un fournisseur directement (mesuré par grep, 11/09)

| Fichier | Import | Devenir |
|---|---|---|
| `src/app/api/agenda/assistant/route.js` | `@ai-sdk/google` | passerelle |
| `src/app/api/agent/events/route.js` | `@ai-sdk/anthropic` + `@ai-sdk/google` + hôte `api.anthropic.com` | passerelle (Claude et Gemini via Vertex UE) |
| `src/app/api/chat/route.js` | `@ai-sdk/google` | passerelle |
| `src/app/api/conges-report/calculer/route.js` | `@google/generative-ai` | passerelle (`generateObject`, même schéma JSON) |
| `src/app/api/generate-resume/route.js` | `@ai-sdk/openai` (`gpt-4.1`) | passerelle, Gemini 2.5 Flash |
| `src/app/api/text-to-speech/route.js` | `@ai-sdk/openai` (`gpt-4o-mini-tts`) | passerelle, Gemini 2.5 Flash TTS (WAV) |
| `src/hooks/use-server.js` | `openai` (`gpt-4o-search-preview`) | **supprimé** (aucun importeur) |
| `src/hooks/useUpdateNews.js` | `openai` (`gpt-3.5-turbo`) | **supprimé** (aucun importeur) |
| `src/library/ai.js` | LangChain OpenAI/Azure embeddings | **supprimé** (aucun importeur) |
| `src/library/agent/rag.js` | `@ai-sdk/google` (embeddings) | passerelle, **même modèle et même dimension** (768) |
| `src/library/ccn/c05/ai-consensus-runner.js` | `@ai-sdk/google` + `openai` (DeepSeek) | Gemini via passerelle ; transport DeepSeek déplacé dans `scripts/ccn/c05/deepseek-transport.mjs` (scripts batch CCN, textes publics) |
| `src/library/chat/conversation-summary.js` | `@google/generative-ai` | passerelle |
| `src/library/chat/legal-tools.js` | `@google/generative-ai` (embeddings BOSS + documents de projet) | passerelle, même modèle, 768 |
| `src/library/chat/search-tool.js` | `fetch` vers `api.tavily.com` | passerelle, Web Grounding for Enterprise dans la requête Vertex |
| `src/library/chat/simulator-audit.js` | `@ai-sdk/google` | passerelle |
| `src/library/controles/source-ia.js` | `@ai-sdk/anthropic` + `@ai-sdk/google` + `@ai-sdk/google-vertex` (seule branche Vertex, jamais active) | passerelle, sans aucun repli |

Hors application (non couverts par la promesse « IA de l'application », signalés pour honnêteté) : les scripts batch `scripts/**` et `src/scripts/**` d'extraction / consensus CCN appellent Gemini, Claude (CLI abonnement), Mistral (Vercel AI Gateway) et DeepSeek sur des **textes conventionnels publics**, sans donnée de salarié. `src/library/cdtn/claude-cli.mjs` (CLI Claude, scripts seulement) n'importe aucun SDK.

## 2. Cible (après)

Un seul point de sortie : `src/library/ai/gateway.js`. Région Vertex AI **europe-west1 (Belgique)**, hôte `europe-west1-aiplatform.googleapis.com` pour toutes les capacités. Authentification : compte de service (rôle « Utilisateur Vertex AI »), échange de jeton vers `oauth2.googleapis.com` (aucune donnée métier).

| Capacité | Modèle | Disponibilité europe-west1 (mesuré, doc Google « Emplacements » datée 2026-09-11) | Résidence / traitement ML (mesuré, doc « Data residency » 2026-09-09) |
|---|---|---|---|
| Texte rapide (chat repli, agent, résumé, report de congés, agenda, audit simulateur, recherche) | `gemini-2.5-flash` | ✔ | EU multi-région ✔ (terminal régional = traitement dans la juridiction UE) |
| Texte approfondi (chat) | `gemini-2.5-pro` | ✔ | EU multi-région ✔ |
| Vérificateur contrôle de paie, agent « claude » | `claude-sonnet-4-5` (`claude-sonnet-4-5@20250929`) | ✔ (seule région UE avec Claude, avec europe-west1 listée explicitement) | EU multi-région ✔, Belgique ✔ |
| Embeddings (documents de projet, BOSS) | `gemini-embedding-001`, 768 dims | ✔ | EU multi-région ✔ |
| Synthèse vocale | `gemini-2.5-flash-tts` | ✔ (europe-west1, west4, north1, central2, southwest1) | non listé dans le tableau de résidence (non vérifié) |
| Recherche web | Web Grounding for Enterprise (dans la requête Vertex) | outil de la requête Gemini | doc « zero data retention » : voie recommandée pour zéro rétention ; « Grounding with Google Search » conserve les requêtes 3 jours (écarté) |

Retirés du produit : OpenAI (résumé, voix) remplacé ; Perplexity : aucune route de production ne l'appelait (constante `llmModels.PERPLEXITY` sans usage) ; Tavily remplacé. Aucune ré-indexation d'embeddings : même modèle, même dimension.

## 3. Après — mesures

Colonnes à remplir par la sonde et par les journaux Vercel (`[ai-gateway] {"host":…}`) après mise en ligne : voir `recap.html` (section « Preuve en production »).
