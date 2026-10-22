# Architecture de la passerelle et conversion des consommateurs

Modèle de référence : `assets/passerelle/gateway.js` et `gateway-config.js` (SmartDataPay, Vercel AI
SDK v6 `ai@6.x`, `@ai-sdk/google-vertex@4.x`, `google-auth-library@10.x`). À copier puis adapter :
l'alerte (Telegram chez SDP), le compteur d'usage (`meter.js`), l'alias d'import (`@/`).

## Inventaire AVANT (mesuré, pas déduit)

```bash
# paquets et imports directs
grep -rnE "@ai-sdk/(openai|anthropic|google|perplexity)|@google/generative-ai|from 'openai'|@anthropic-ai/sdk|tavily|perplexity" src --include=*.js --include=*.ts --include=*.mjs
# hôtes en clair
grep -rnE "api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|api\.tavily\.com|api\.perplexity\.ai|aiplatform\.googleapis\.com" src
# variables d'environnement
grep -rnE "OPENAI_API_KEY|ANTHROPIC_(API_)?KEY|GOOGLE_(GENERATIVE_AI_)?API_KEY|TAVILY_API_KEY|PERPLEXITY_API_KEY|GOOGLE_VERTEX_" src scripts
```

Résultat SDP : 16 fichiers de `src/` important un fournisseur, 23 points d'appel, et — la découverte qui
comptait — **aucune variable `GOOGLE_VERTEX_*` en production** : le code « Vertex UE » écrit le 09/08
n'avait jamais tourné ; tout partait en direct vers les États-Unis ou l'hôte global de Google.

Puis la **sonde des routes en production** avec le compte de test (`assets/scripts/sonde-routes-ia.mjs`,
storageState Playwright du runner `test-app`) → `sonde-avant-<date>.json`. Chez SDP : voix 500 (OpenAI
mort), résumé 500, chat 200, agent 200, contrôle de paie 422 (clé Anthropic morte), report de congés 200.
Ce fichier est la référence de non-régression : après, chaque route doit être ≥ à ce qu'elle était.

## Deux fichiers, une frontière

`gateway-config.js` — **aucun import de fournisseur** (importable par les tests et le contrôle de
santé sans charger le SDK) :
- `AI_GATEWAY_REGION_PATTERN = /^europe-[a-z0-9]+$/` et `AI_GATEWAY_HOST_PATTERN` (`europe-<x>-aiplatform.googleapis.com`),
  `AI_GATEWAY_AUTH_HOST = 'oauth2.googleapis.com'` (le seul autre hôte autorisé : le jeton OAuth).
- `AI_MODELS` par **capacité**, pas par fournisseur : `TEXT_FAST`, `TEXT_PRO`, `CLAUDE_SONNET`, `EMBEDDING`,
  `SPEECH`. `vertexModelId()` traduit (`claude-sonnet-4-5` → `claude-sonnet-4-5@20250929`).
- `readVertexConfig(env)` : `null` si une variable manque ; lève `AI_GATEWAY_REGION_NOT_EU` (statut 503,
  message **sans la valeur**) si la région n'est pas dans la liste UE fermée — `us-central1`, `global`, `europe-west2`, `europe-west6`, `eu` refusés comme RÉGION (la multi-région `eu` est fixée par la passerelle, jamais lue d'une variable). ⚠️ Mis à jour le 25/09/2026 : voir `lecons-et-pieges.md` (retrait de Gemini 2.5) ; la référence de code est SDP après PR #480.
- `gatewayStatus(env)` pour le contrôle de santé quotidien ; `isProductionRuntime` = `VERCEL_ENV === 'production'`.

`gateway.js` — le seul fichier autorisé à construire un fournisseur (`createVertex`, `createVertexAnthropic`) :
- `createAiGateway({ env, config, getAccessToken, fetch, onTrace })`. Sans configuration → lève
  `AiGatewayNotConfiguredError` (503) et, en production, alerte une fois (Telegram) avec un message
  **statique** conforme à l'audit des émetteurs d'alerte du projet.
- Jeton : `GoogleAuth` (compte de service, portée `cloud-platform`) ; un jeton de test
  `AI_GATEWAY_TEST_ACCESS_TOKEN` n'est honoré que hors Vercel **et** hors production.
- `tracedFetch` **fail-closed** : refuse **avant émission** tout hôte qui n'est ni `europe-*-aiplatform`
  ni `oauth2` ; trace une ligne `[ai-gateway] {"gw":"vertex-eu","host","model","op","status","ms"}` —
  jamais de corps, de prompt, de jeton. `AI_GATEWAY_DEBUG_ERRORS=1` (hors Vercel/prod seulement) ajoute le
  corps des 4xx/5xx du fournisseur pour le diagnostic local.
- `createVertex({ project, location, apiKey: '', googleAuthOptions: { authClient }, fetch })` : `apiKey: ''`
  **neutralise l'express mode** (qui bascule sur un hôte global si `GOOGLE_VERTEX_API_KEY` traîne).
- `createVertexAnthropic({ ..., generateAuthToken, fetch })` pour Claude.
- Surface publique : `languageModel(id)`, `embeddingModel(id)`, `embedProviderOptions(dim)` →
  `{ vertex: { outputDimensionality } }`, `webSearchTool()` → `vertex.tools.enterpriseWebSearch({})`,
  `synthesizeSpeech({ text, voice, language })` (REST `:generateContent` avec `responseModalities: ['AUDIO']`,
  PCM 24 kHz → WAV par `pcmToWav`). **Pas** de `getAccessToken` exposé (verdict sécurité).
- Exports pratiques : `getAiGateway()` (singleton), `resetAiGatewayForTests()`, `aiLanguageModel`,
  `aiEmbeddingModel`, `aiEmbedProviderOptions`, `aiSynthesizeSpeech`, `aiWebSearchTool`,
  `gatewayErrorResponse(err)` (tout code `AI_GATEWAY_*` → 503 JSON « Service IA indisponible… »).

## Convertir un consommateur

Motif général : remplacer `createOpenAI/createAnthropic/createGoogleGenerativeAI(...)('model')` par
`aiLanguageModel(AI_MODELS.TEXT_FAST)` ; `embed`/`embedMany` avec `aiEmbeddingModel()` +
`providerOptions: aiEmbedProviderOptions(DIM)` ; recherche web → outil `webSearch` qui appelle
`generateText` avec `aiWebSearchTool()` et renvoie `result.sources` ; voix → `aiSynthesizeSpeech` (WAV).

Règles qui ont toutes été exigées par un verdict :
- **Aucun repli** : si la passerelle lève, la route répond `gatewayErrorResponse(err)` (503) — jamais un
  autre fournisseur, jamais une autre région.
- **Jamais `err.message`** journalisé ou renvoyé : nom, code, statut seulement (`safeErrorLabel`). Le SDK
  met la sortie du modèle dans `JSONParseError « Text: … »` et `TypeValidationError « Value: … »`.
- **Messages utilisateur** sans code technique, avec accents, qui disent quoi faire.
- `generateObject` + `jsonSchema()` pour les sorties structurées (remplace `responseSchema` de l'ancien SDK Google).
- Outils : `inputSchema:` (jamais `parameters:`) ; pour Claude, pas de `allOf/anyOf/oneOf/if` au premier
  niveau du schéma (voir `lecons-et-pieges.md`).
- Chat avec fournisseur externe : retirer les outils réservés au déterministe (chez SDP,
  `removeC09ToolsFromExternalAiProvider`).
- Ce qui n'est pas de l'application (scripts batch, pipelines CCN, transport DeepSeek) sort de `src/` vers
  `scripts/` avec une injection de transport, et reste bloqué par sa propre garde de budget.

Supprimer ce qui devient mort (chez SDP : `use-server.js`, `useUpdateNews.js`, `library/ai.js`) après avoir
prouvé l'absence d'importeur.

## Disponibilité des modèles par région (à re-vérifier à chaque chantier)

Sources officielles, lues le 11/09/2026 (URL dans `assets/preuves-exemple/sources-officielles.md`) :
« Emplacements des points de terminaison » Vertex, « Data residency », « Claude on Google Cloud »,
« zero data retention », « Service Specific Terms » (§ 18 « Training Restriction », § 20 Web Grounding).
`europe-west1` servait Gemini 2.5 Flash / Pro, `gemini-embedding-001`, `gemini-2.5-flash-tts`, Claude
Sonnet 4.5 et 4.6. `europe-west9` (Paris) ne servait **pas** Claude. Refaire cette lecture : les
catalogues bougent chaque trimestre.

Dimension des embeddings : lire la dimension des vecteurs déjà en base (SDP : 768) et la passer en
`outputDimensionality` ; sinon la recherche documentaire casse et il faut ré-indexer.

## Contrôle de santé

Ajouter au contrôle quotidien une ligne « Passerelle IA européenne » lue depuis `gatewayStatus(env)` :
configurée / région / hôte. Un déploiement sans variables tombe en `crit` le matin même au lieu d'être
découvert par un utilisateur.
