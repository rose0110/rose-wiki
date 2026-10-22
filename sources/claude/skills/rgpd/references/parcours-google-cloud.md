# Parcours Google Cloud — du projet vide à la clé dans Vercel

Fait avec Rose le 11/09/2026 (~18 h) pour SmartDataPay, dans le navigateur intégré connecté à son
compte Google. Rose clique ; je navigue, je préremplis, je lis l'écran et je lui dis l'étape suivante
(une seule à la fois, numérotée « Étape n/8 », j'attends son « fait »). Rien ici n'exige que Rose
crée un dossier ou un fichier : tout ce qui n'est pas son compte, son mot de passe ou son argent est fait
par moi.

## 0. Avant de commencer — coût et compte

- Rose a **déjà un compte Google Cloud payant** (compte de facturation « ROSE YEMELI », identifiant de
  la forme `XXXXXX-XXXXXX-XXXXXX`). On le **réutilise** : pas de nouveau moyen de paiement.
- Vertex AI se facture à l'usage (jetons entrants/sortants par modèle). Ne jamais donner un tarif de
  mémoire : lire https://cloud.google.com/vertex-ai/generative-ai/pricing au moment du chantier. Ordre de
  grandeur observé chez SDP : Gemini 2.5 Flash coûte quelques centimes pour des milliers d'appels de
  chat ; Claude Sonnet est ~10 à 20 fois plus cher par jeton → le réserver au 2e avis.
- Poser un **budget avec alerte** dans Facturation → Budgets et alertes (montant mensuel + seuils 50/90/100 %),
  et garder les plafonds de dépense côté application (chez SDP : `src/library/ai/meter.js`, décision du
  02/08/2026 après la facture de 2 000 €).
- Recommandation : **un projet Google Cloud par application** (coût lisible par application, une clé
  révocable par application, rayon d'impact limité). Le compte de facturation reste commun.

## 1. Créer le projet (Rose clique)

URL : https://console.cloud.google.com/projectcreate
- Nom du projet : `<application>-ia-europe` (ex. `smartdatapay-ia-europe`). Google génère l'identifiant ;
  le noter (ex. `smartdatapay-ia-europe`, numéro `216613504614`).
- Organisation : « Aucune organisation » si le compte est un compte personnel/pro sans Workspace.
- Après création : sélectionner le projet (bandeau du haut).

## 2. Associer la facturation (Rose clique)

URL : https://console.cloud.google.com/billing/linkedaccount?project=<id-projet>
- Choisir le compte de facturation existant. Sans cela, l'API Vertex refuse tout appel.
- ⚠️ **Entité contractante** : dépend de l'**adresse de facturation** du compte. Tableau officiel
  https://cloud.google.com/terms/google-entity (« Last modified June 30, 2026 ») : France → **Google Cloud
  France** ; reste de l'EMEA → Google Cloud EMEA Limited (Irlande) ; États-Unis et autres → Google LLC.
  C'est le nom qui doit figurer dans les textes légaux comme sous-traitant ultérieur. Le confirmer sur la
  première facture (page Facturation → Documents) : la page n'est pas lisible sans la session de Rose.

## 3. Activer l'API Vertex AI (Rose clique)

URL : https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=<id-projet>
- Bouton « Activer ». Prend ~30 s.

## 4. Activer Claude dans Model Garden (Rose clique, je remplis le questionnaire)

URL : https://console.cloud.google.[CHAÎNE OPAQUE MASQUÉE]?project=<id-projet>
- Bouton « Activer » → un **questionnaire Anthropic** s'ouvre (usage prévu, secteur, volume, site web,
  acceptation des conditions). Je le préremplis (Rose : « tu peux faire ça au moins ») avec des réponses
  vraies : société Smart Data Pay, logiciel de paie / RH, assistant et contrôle de paie, volume estimé,
  URL de l'application. Rose valide et coche l'acceptation des conditions.
- Vérifier ensuite que la fiche indique « Activé » et que `europe-west1` figure dans les régions.
- Sans cette étape : `rawPredict` répond 403/404 sur les modèles Claude.

## 5. Créer le compte de service (Rose clique, je dicte les valeurs)

URL : https://console.cloud.google.com/iam-admin/serviceaccounts/create?project=<id-projet>
- Nom : `<application>-vercel` (ex. `smartdatapay-vercel`). Email généré :
  `<nom>@<id-projet>.iam.gserviceaccount.com`.
- Étape « Accorder l'accès » : rôle **« Utilisateur Agent Platform »** (libellé français de
  `roles/aiplatform.user`, l'interface a été renommée « Gemini Enterprise Agent Platform »). Rien de plus
  large (pas Éditeur, pas Propriétaire).
- ⚠️ Propagation IAM : ~1 minute. Les premiers appels répondent 403 puis passent (mesuré : 6 × 403 puis 200).

## 6. Créer la clé JSON (Rose clique, je consomme puis je supprime)

Compte de service → onglet « Clés » → « Ajouter une clé » → « Créer une clé » → JSON. Le fichier se
télécharge dans `Téléchargements`.
- Je le lis **une fois** pour poser les variables, je vérifie, puis je **supprime** le fichier local
  (règle : la clé n'existe que dans le gestionnaire de secrets de l'hébergeur). Ne jamais le committer,
  ne jamais le coller dans un journal ou une passation.
- Si la clé est compromise : la révoquer dans ce même onglet et en créer une autre ; rien à changer dans le code.

## 7. Poser les variables (moi)

Quatre variables, mêmes noms partout :

| Variable | Valeur | Source |
|---|---|---|
| `GOOGLE_VERTEX_PROJECT` | identifiant du projet | `project_id` du JSON |
| `GOOGLE_VERTEX_LOCATION` | `europe-west1` | décision |
| `GOOGLE_VERTEX_CLIENT_EMAIL` | email du compte de service | `client_email` |
| `GOOGLE_VERTEX_PRIVATE_KEY` | clé privée PEM avec `\n` littéraux ou vrais retours à la ligne | `private_key` |

- **Vercel** : `assets/scripts/poser-variables-vertex.mjs` (API Vercel, `type: encrypted`, cibles
  `production` **et** `preview`, upsert). Jeton et identifiants du projet dans la mémoire du projet. La
  variable ne s'applique qu'au **prochain** déploiement.
- **VPS / Node (systemd)** : fichier d'environnement `chmod 600` référencé par `EnvironmentFile=`, ou
  le gestionnaire de secrets du fournisseur ; redémarrer le service. Même quatre noms.
- Jamais `GOOGLE_VERTEX_API_KEY` : l'« express mode » du SDK bascule sur un hôte **global** (non
  régional) ; la passerelle le neutralise (`apiKey: ''`) et un test le vérifie.

## 8. Vérifier avec la vraie clé (moi)

1. `node assets/scripts/verifier-acces-vertex.mjs <cle.json>` → 6 capacités (Gemini Flash, Pro, Claude,
   embeddings, voix, recherche ancrée) toutes en 200 sur `europe-west1-aiplatform.googleapis.com`.
2. `SDP_VERTEX_ENV_FILE=<env> node assets/scripts/verifier-capacites-avancees.mjs` → embedMany à 50,
   sources de la recherche, Claude avec outil + thinking, Gemini Pro avec outil.
3. Serveur local avec les vraies variables (`serveur-local-vertex.mjs`) puis sonde des routes.
4. Supprimer le fichier de clé / d'environnement tiré.

## Demandes hors console (Rose, plus tard)

- **Exemption de journalisation anti-abus** : Google conserve les prompts jusqu'à 30 jours pour détecter
  les abus, sauf exemption accordée sur demande (formulaire cité par la page « zero data retention »).
  Tant qu'elle n'est pas accordée, les textes légaux disent « jusqu'à trente jours ».
- **Cloud Data Processing Addendum** : version courante à archiver dans `sources-officielles.md`
  (version du 8 juin 2026 lue le 11/09/2026 ; § 4.1 « Restricted Transfers » = clauses contractuelles types).
