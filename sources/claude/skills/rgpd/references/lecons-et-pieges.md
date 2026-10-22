# Leçons et pièges — tout ce qui a cassé le 11/09/2026, et la parade

Classé par moment du chantier. Chaque ligne a été vécue, pas imaginée.

## Pendant le code

| Piège | Ce qui s'est passé | Parade |
|---|---|---|
| `parameters:` (SDK v4) au lieu de `inputSchema:` (v6) | 31 outils de l'Agent Paie partaient **sans schéma** ; Gemini direct acceptait et n'a jamais validé un argument ; Vertex répond 400 « functionDeclaration parameters schema should be of type OBJECT ». | Renommer. Vérifier ensuite par une sonde qu'un outil reçoit `{ brut: 2800 }` typé nombre. |
| `allOf` / `anyOf` / `oneOf` / `if` au premier niveau d'un schéma d'outil | Anthropic (via Vertex) refuse : « tools.8.custom.input_schema: input_schema does not support oneOf, allOf, or anyOf at the top level » → **tout** le mode Claude tombe. Gemini accepte. L'index (`tools.8`) compte **après** retrait des outils filtrés et dans l'ordre de l'objet (les outils importés par `...spread` viennent en premier). | Côté Claude, adapter les schémas (retirer la composition au premier niveau, garder les règles dans l'exécution) ; les tests du projet peuvent exiger que le schéma source garde son `allOf`. |
| `err.message` journalisé/renvoyé | Le SDK y embarque la sortie du modèle (`JSONParseError « Text: … »`, `TypeValidationError « Value: … »`) et les erreurs IAM citent projet/région/compte de service. | `safeErrorLabel(err)` : nom, code, statut. Partout, y compris les `catch` des routes et le compteur d'usage. |
| Express mode | `GOOGLE_VERTEX_API_KEY` présent → le SDK contacte l'hôte **global**. | `apiKey: ''` dans `createVertex` + test qui vérifie l'absence d'émission. |
| Jeton de test en prod | `AI_GATEWAY_TEST_ACCESS_TOKEN` honoré par `VERCEL_ENV` seulement → preview Vercel exposée. | Ignorer dès que `VERCEL === '1'` ou production. |
| Erreur de région en 500 | `Error` simple → 500 générique, message avec la valeur. | Code `AI_GATEWAY_REGION_NOT_EU`, statut 503, message sans valeur ; `gatewayErrorResponse` reconnaît tout `AI_GATEWAY_*`. |
| Codes techniques à l'écran | « … (code AI_APICallError) » dans le flux de l'Agent Paie ; Zod `C08_CONVENTIONAL_INPUT_REQUIRED:idcc` réinjecté au modèle. | Message utile sans code ; code dans le journal serveur ; test qui lit les textes visibles (règle du 11/09). |
| Vérificateur hors du `try` | `getModelVerificateur()` appelé avant le `try` → le 2e avis fait échouer le contrôle au lieu de se dégrader en `null`. | Tout ce qui touche la passerelle dans le `try`. |
| Fausses clés dans les tests | Le scanner de secrets du dépôt détecte `[CLÉ PRIVÉE MASQUÉE]