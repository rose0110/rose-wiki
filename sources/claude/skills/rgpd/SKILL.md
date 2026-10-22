---
name: rgpd
description: Faire sortir TOUS les appels d'intelligence artificielle d'une application par une passerelle unique vers Vertex AI en région européenne (Google Cloud europe-west1), avec refus explicite hors UE, preuve par les journaux et mise à jour des textes légaux (DPA, RGPD, sous-traitants, registre). À charger dès que Rose veut qu'une application « tourne sur des serveurs européens », parle d'IA et de données sensibles (paie, DSN, santé, RH, clients), de RGPD/DPA/sous-traitants pour une fonction IA, veut remplacer OpenAI/Anthropic direct/Perplexity/Tavily par une solution UE, veut créer un projet Google Cloud ou une clé de compte de service pour Vertex, ou veut réutiliser « ce qu'on a fait pour SmartDataPay » (chantier du 11/09/2026) dans une autre application (DataPaie, HUP-RH, verticales, site). S'applique même si elle ne prononce ni « Vertex » ni « passerelle ».
---

# RGPD — IA en Europe : une passerelle, une région, une preuve

Ce que cette compétence sait faire : prendre une application qui appelle des modèles d'IA n'importe où
(OpenAI, Anthropic direct, Gemini « global », Perplexity, Tavily…) et la faire sortir **par un seul
module** vers **Vertex AI en région européenne**, sans repli silencieux, avec la preuve dans les
journaux et des textes légaux qui disent enfin la vérité. Elle a été construite sur SmartDataPay le
11/09/2026 (PR #376, prod `8fe0f570a`) ; tout ce qui suit a été **mesuré** là, pas supposé.

Pourquoi c'est un sujet : « hébergé en France » est vrai pour la base et l'application, mais dès qu'un
bulletin, une DSN ou un arrêt de travail part dans un prompt vers un serveur américain, la phrase est
fausse, le DPA aussi, et le registre RGPD aussi. Le juriste l'a dit clairement : on ne promet jamais
« aucun transfert hors UE » ; on promet « aucun sous-traitant établi hors UE, traitement en région UE,
accès depuis un pays tiers encadré par les clauses contractuelles types ».

## Les décisions déjà prises (ne pas les rouvrir sans raison)

| Sujet | Décision | Pourquoi |
|---|---|---|
| Fournisseur | Vertex AI (Google Cloud), **deux terminaux UE** : multi-région `eu` (`aiplatform.eu.rep.googleapis.com`) pour le texte Gemini 3.x ; région `europe-west1` (Belgique) pour Claude, `gemini-embedding-001` et Gemini TTS | Depuis le retrait de Gemini 2.5 (20/10/2026), ses remplaçants ne sont servis en UE que par `eu` ; embeddings, TTS et Claude 4.6 ne le sont pas par `eu`. Doc Google du 24/09/2026, relue le 25/09. **Relire la doc à chaque chantier** : ce tableau change. Liste FERMÉE des régions UE (Londres `europe-west2` et Zurich `europe-west6` = hors UE). |
| Modèles | `gemini-3.5-flash-lite` = rapide (remplaçant officiel de 2.5 Flash, ≈ même coût) ; `gemini-3.5-flash` = « pro » (remplaçant de 2.5 Pro, ≈ même coût) ; `claude-sonnet-4-6` = 2e avis (sans @date) ; `gemini-embedding-001` (768) ; `gemini-2.5-flash-tts` | Colonne « Replacement model ID » de « Model versions and lifecycle ». ⚠️ **Chaque modèle Claude s'active séparément dans le Model Garden** : Sonnet 4.6 répondait 404 chez SDP alors que 4.5 répondait 200 (mesuré 25/09). Gemini 3 : `thinkingLevel` au lieu de `thinkingBudget`, température 1 recommandée — traduits dans la passerelle (SDP PR #480). |
| Recherche web | Web Grounding for Enterprise (`enterprise_web_search`), **pas** Grounding with Google Search | Google Search stocke les requêtes 3 jours ; l'Enterprise passe dans la même requête Vertex. |
| Embeddings | `gemini-embedding-001` avec `outputDimensionality` = dimension existante (768 chez SDP) | Aucune ré-indexation. `embedMany` à 50 valeurs en un appel : mesuré 200. |
| Sans variables | **Refus** (503 + alerte), jamais de repli vers un terminal US | C'est la promesse qui rend la phrase publique vraie. |
| Authentification | Clé de compte de service (JSON) dans les variables d'environnement, rôle `roles/aiplatform.user` | Simple, révocable par application. La fédération OIDC Vercel↔GCP est l'alternative documentée. |
| Pseudonymisation | **Retirée** des textes si elle n'est pas réellement appliquée | Une promesse fausse depuis l'origine chez SDP ; les regex cassaient les dates et montants de paie. Pas de troisième voie. |
| Textes légaux | Modifiés **après** la preuve prod, jamais avant | Règle de Rose : on décrit ce qui tourne, pas ce qu'on espère. |

## Le parcours en 8 étapes

Chaque étape dit qui agit. Tout ce qui n'exige pas le compte, le mot de passe ou l'argent de Rose se
fait sans elle (règle 18 du CLAUDE.md global : un dossier, un fichier, une recherche ne sont jamais une
étape pour Rose).

1. **Inventaire mesuré AVANT** — grep des paquets fournisseurs (`@ai-sdk/openai`, `@ai-sdk/anthropic`,
   `@ai-sdk/google`, `@google/generative-ai`, `openai`, `@anthropic-ai/sdk`, `tavily`, `perplexity`) et des
   hôtes (`api.openai.com`, `api.anthropic.com`, `generativelanguage.googleapis.com`, `api.tavily.com`,
   `api.perplexity.ai`) ; sonde des routes IA en production avec le compte de test → fichier
   `sonde-avant-<date>.json`. Sans ce « avant », aucune non-régression n'est prouvable.
   → `references/architecture-passerelle.md` § Inventaire.
2. **Passerelle** — `src/library/ai/gateway.js` + `gateway-config.js` (copier depuis `assets/passerelle/`,
   adapter l'alerte et le compteur d'usage). Convertir **tous** les consommateurs ; supprimer les anciens
   points de sortie. → `references/architecture-passerelle.md`.
3. **Juge local** — tests statiques (frontière), configuration sans réseau, garde réseau à l'exécution
   (préchargeur qui intercepte dns/net/tls/http/fetch), suites de non-régression du projet. Workflow CI.
   → `references/juge-et-preuves.md`.
4. **Projet Google Cloud** — **le seul point d'arrêt** : Rose clique, je navigue et préremplis.
   Projet, facturation (compte existant), API Vertex, Claude dans Model Garden (questionnaire Anthropic),
   compte de service + clé JSON, rôle. → `references/parcours-google-cloud.md`.
5. **Variables** — posées par script (Vercel : Production **et** Preview, chiffrées) ; clé locale supprimée
   après usage ; vérification réelle 6/6 capacités puis capacités avancées 4/4 avec la vraie clé.
6. **Verdicts écrits** avant tout déploiement : `securite-rgpd`, `testeur-qa`, `expert-paie` (si la paie
   est touchée), `juriste-paie` (textes). Un NO-GO = correction, pas discussion.
7. **Mise en ligne** par la procédure du projet (SDP : `deploy-vercel-sur`, `mettre-en-ligne-master.mjs`),
   avec le go de Rose (ses projets) ; puis **preuve prod** : sonde sur le domaine public + journaux
   `[ai-gateway]` tous en `europe-*`, aucun `refused` ; plan post-déploiement (outils typés, refus sans
   jargon, sources web, bulletin de référence). Rollback = correctif par-dessus le dernier HEAD.
8. **Textes légaux** (PR séparée, après la preuve) : pages `/legal/*`, registre art. 30, DPA, conformité,
   notification clients **préparée mais jamais envoyée** sans décision de Rose.
   → `references/textes-legaux.md`.

Pour lancer tout cela dans une autre session façon `/goal`, partir de `assets/prompt-chantier-modele.md`
(le prompt exact qui a produit le chantier SDP) et l'adapter : nom du dépôt, routes, procédure de
déploiement, compte de test.

## Ce qui a mordu (lire avant de coder)

Les pièges complets sont dans `references/lecons-et-pieges.md`. Les cinq qui coûtent le plus cher :

- **`parameters:` n'existe plus dans le Vercel AI SDK v6** : un outil déclaré ainsi part **sans schéma**.
  Gemini direct l'acceptait en silence (et n'a jamais validé un argument) ; Vertex répond 400
  « should be of type OBJECT ». Renommer en `inputSchema:`. Chez SDP : 31 outils.
- **Anthropic refuse `allOf`/`anyOf`/`oneOf` au premier niveau** d'un `input_schema` d'outil ; Gemini les
  accepte. Un outil avec des conditions `if/then` au niveau racine casse tout le mode Claude (mesuré en
  prod le 11/09 : « tools.8.custom.input_schema… »). Adapter les schémas côté Claude ou déplacer les
  conditions dans l'exécution.
- **Jamais `err.message` dans un journal ou une réponse** sur un chemin IA : le SDK y met la **sortie du
  modèle** (donc le contenu lu du bulletin) et les erreurs IAM citent projet et compte de service. Code +
  statut seulement.
- **L'API Vercel ne déchiffre pas les variables `encrypted`** (elle renvoie un blob) et les variables
  `sensitive` sortent en `[SENSITIVE]` : pour tester en local avec les vraies valeurs, `vercel env pull`
  puis supprimer le fichier.
- **Vocabulaire à l'écran** : aucun `(code AI_APICallError)`, aucun `C08_…`, aucun « fail-closed » ne doit
  atteindre l'utilisateur. Une phrase utile, le code dans le journal serveur.

## Ce qui reste toujours à Rose

- Créer le projet Google Cloud / choisir le compte de facturation / créer la clé (son compte Google).
- Dire « go » pour la production (ses projets, règle 19).
- Arbitrer la version du DPA (re-signature ou position écrite « non substantiel ») et l'envoi de la
  notification aux clients.
- Demander à Google l'exemption de journalisation anti-abus (formulaire, son compte).
- Lire l'entité Google contractante sur la première facture (adresse de facturation en **France →
  Google Cloud France**, pas Google Cloud EMEA Limited ; tableau officiel du 30/06/2026).

## Fichiers de la compétence

- `references/parcours-google-cloud.md` — le chemin de clics exact, les rôles, les coûts, l'entité contractante.
- `references/architecture-passerelle.md` — conception de la passerelle, conversion des consommateurs, modèles par capacité, SDK.
- `references/juge-et-preuves.md` — les quatre juges, la garde réseau, le dossier de preuves, les verdicts.
- `references/textes-legaux.md` — formulations validées par le juriste, interdits, notification, phrase de stand.
- `references/lecons-et-pieges.md` — tout ce qui a cassé et comment on l'a contourné.
- `assets/passerelle/` — `gateway.js`, `gateway-config.js` (version SDP, à adapter).
- `assets/tests/` — frontière statique, configuration, garde réseau (préchargeur + sondes adverses).
- `assets/scripts/` — poser les variables, vérifier la clé, sonder les routes, serveur local sous garde.
- `assets/ci/ia-europe.yml` — workflow GitHub Actions.
- `assets/prompt-chantier-modele.md` — le prompt-chantier complet, à adapter puis lancer par `/goal`.
- `assets/preuves-exemple/` — récap HTML, verdicts, brouillons légaux, sources officielles du chantier SDP.
