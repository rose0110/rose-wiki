# Briques réutilisables — état SmartDataPay du 11/09/2026

Tout est copié tel quel depuis la PR #376 (branche `chantier/ia-en-europe`, fusionnée dans `master`
`8fe0f570a`). Rien n'est générique par magie : voici ce qu'il faut adapter en changeant d'application.

## `passerelle/`
- `gateway-config.js` — sans dépendance : copier tel quel. Adapter `AI_MODELS` si l'application n'a pas
  besoin de Claude ou de la voix.
- `gateway.js` — dépend de `ai`, `@ai-sdk/google-vertex`, `google-auth-library`, et de deux briques SDP :
  `@/library/notifications/telegram` (alerte « passerelle non configurée » en production) et le journal.
  Remplacer l'alerte par le canal de l'application (mail, Telegram, journal) en gardant le motif audité
  (statut contrôlé, `catch` non vide, message statique). Remplacer l'alias `@/` si l'application n'en a pas.

- `anthropic-tool-schema.js` — adapte les outils quand le modèle est Claude (retire `allOf`/`anyOf`/`oneOf`/`if` au premier
  niveau ; Anthropic les refuse, Gemini les accepte). À brancher dans la route : `isClaude ? adaptToolsForAnthropic(tools).tools : tools`.

## `tests/`
- `frontiere-statique.test.js` — adapter `ROOT`, `SRC`, `GATEWAY` (chemin de la passerelle) et la liste
  des anciens fichiers supprimés ; la liste des paquets et hôtes interdits est réutilisable.
- `passerelle-config.test.js` — dépend de `gateway.js` et `gateway-config.js` : mêmes chemins.
- `outils-anthropic.test.js` — l'adaptation pour Claude + « chaque catégorie émise par le moteur de contrôle est rattachée à un
  contrôle du catalogue » (lecture statique des sources ; adapter les chemins).
- `garde-reseau-preload.cjs` + `garde-reseau.test.mjs` + `probes/` — réutilisables tels quels (liste
  blanche `europe-*-aiplatform` + `oauth2`) ; les sondes importent la passerelle par chemin relatif.
- Scripts `package.json` chez SDP : `test:ia-europe`, `test:ia-europe:network`, `test:ia-europe:all`, `sonde:ia-europe`.

## `scripts/`
- `poser-variables-vertex.mjs` — API Vercel : `VERCEL_TOKEN`, identifiant du projet et de l'équipe à
  adapter ; pose Production + Preview en `encrypted`. Pour un VPS, remplacer par l'écriture du fichier
  d'environnement `chmod 600`.
- `verifier-acces-vertex.mjs <cle.json>` et `verifier-capacites-avancees.mjs` (`SDP_VERTEX_ENV_FILE`) —
  réutilisables ; ils importent la passerelle par chemin relatif.
- `sonde-routes-ia.mjs` — **spécifique** : liste des routes IA de SDP et leurs corps de requête. Réécrire la
  liste pour l'application ; garder l'aide `probe()` et `streamExcerpt()`. Exige un storageState Playwright
  du compte de test (chez SDP : runner `test-app`, `auth-prod.json`).
- `sonde-post-deploiement.mjs` — spécifique (outils de l'Agent Paie, bulletin de référence) ; garder la
  structure (verdict par ligne, détection de jargon `JARGON`).
- `garde-reseau-serveur.mjs` — serveur `next dev` sous préchargeur ; adapter la commande de démarrage et
  la liste blanche « dev » (base, polices, Sentry).
- `serveur-local-vertex.mjs` — serveur local avec les vraies variables tirées par `vercel env pull` ;
  adapter la liste des variables publiques à transmettre.
- `diagnostic-outil-vertex.mjs` — quels mots-clés de schéma Vertex refuse dans une déclaration d'outil.

## `ci/ia-europe.yml`
Deux jobs (frontière + configuration ; garde réseau). Adapter les scripts npm et la version de Node.

## `prompt-chantier-modele.md`
Le prompt `/goal` exact du chantier SDP : cible, coordination automatique, juge, faits durs, garde-fous et
points d'arrêt, ressources, définition de « terminé ». Pour une autre application : remplacer le dépôt, les
routes, le compte de test, la procédure de déploiement, les suites de non-régression et le nom du responsable ;
garder la règle « ne me demande rien sauf ce que seule Rose peut créer » et la séquence « textes légaux après
la preuve ».

## `preuves-exemple/`
Récap HTML, verdicts, brouillons légaux (v2), sources officielles et inventaire du chantier SDP : des
modèles de forme et de niveau d'exigence, pas des textes à recopier sans relire (les sources datent du
11/09/2026 ; les catalogues de modèles et les conditions Google changent).
