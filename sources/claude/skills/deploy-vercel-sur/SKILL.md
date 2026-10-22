---
name: deploy-vercel-sur
description: >-
  Déploiement Vercel SÛR des apps de Rose (SmartDataPay, DataPaie, blog paie),
  avec les garde-fous anti-régression encodés — surtout le piège « arbre de
  travail partagé entre sessions » qui a DÉJÀ fait RECULER la prod (un
  `vercel deploy --prod` d'un HEAD en retard reprend l'alias et annule des
  correctifs). À utiliser dès que Rose veut « déployer », « mettre en prod »,
  « pousser en prod », « mettre en ligne », lancer un `vercel deploy`, ou
  vérifier quel commit est réellement live. Chaque app a une mécanique
  DIFFÉRENTE : ce skill route vers la bonne procédure et impose la preuve en prod.
---

# Déploiement Vercel sûr

## RÈGLE ABSOLUE (ne jamais l'enfreindre)

**Aucun `vercel deploy --prod` sans le « go / oui / envoie » EXPLICITE de Rose.**
Ces apps touchent la paie et Stripe est en LIVE. Un déploiement raté = argent/données réels.
Voir aussi la règle « pas de push sans confirmation ».

Avant de proposer le go, montrer : **quoi** est déployé, **où** (quelle app/domaine), **quel commit (SHA)**, **ce qui change**. Puis ATTENDRE.

---

## RÉFLEXE N°1 — Identifier l'app AVANT de faire quoi que ce soit

Les 3 apps ont des mécaniques **incompatibles**. Ne jamais appliquer la procédure d'une app à une autre.

| App | Projet Vercel | Domaine prod | Mécanique de MISE EN PROD | Framework |
|---|---|---|---|---|
| **SmartDataPay** | `smartdatapay-ai` | www.smartdatapay.app | ⚠️ `vercel deploy --prod` **explicite** — le push N'auto-déploie PLUS (voir ci-dessous) | Next (turbopack) |
| **DataPaie** | `logiciel-paie-datapaie` | logiciel.datapaie.com | `vercel deploy --prod` **explicite** (push = previews seulement) | Vite |
| **Blog paie** | `blog-paie` | blog.roseyemeli.com | `vercel deploy --prod` explicite | Vite |

Compte CLI commun : **`contact-2491`** (déjà authentifié, CLI dans `node_modules`). Team `team_8TC9QayMpzN2Qcjerz3flrfS`.

---

## GARDE-FOU UNIVERSEL — anti « reculer la prod »

L'arbre de travail est **partagé entre plusieurs sessions Claude** qui poussent en rafale. Le piège vécu (SmartDataPay, 23/06) : `git push` répond « Everything up-to-date » alors que `git ls-remote origin master` montre un SHA **plus récent** → ton local est un **ancêtre** du remote. Déployer cet ancêtre en CLI **reprend l'alias prod et annule les correctifs des autres sessions**.

**Avant ET après tout déploiement, vérifier que le SHA déployé == HEAD remote :**

```bash
git ls-remote origin <branche>   # noter le SHA distant
git rev-parse HEAD               # doit être == au SHA distant
```

Si HEAD local est en retard : `git merge --ff-only origin/<branche>` puis déployer le **bon** SHA. Ne JAMAIS déployer un ancêtre.

---

## Procédure par app

### A. SmartDataPay — ⚠️ le push N'auto-déploie PLUS

> **RÈGLE « chacun déploie, personne n'écrase » (décision Rose, 09/09/2026).** Codex, les sessions
> Claude et les humains gardent chacun le droit de déployer, mais on ne déploie QUE la tête exacte de
> `origin/master`, signée par `--env DEPLOIEMENT_SHA`. Une garde `prebuild`
> (`scripts/deploiement/garde-tete-de-master.mjs`) refuse en production tout build non signé ou qui
> n'est pas la tête de master (API GitHub, jeton Vercel `GITHUB_TOKEN_GARDE_DEPLOIEMENT`). Si le build
> est refusé : `git merge --ff-only origin/master` puis redéployer — jamais contourner la garde.

Branche `master`, repo `Smart-Data-Pay-AI/smartdatapay-app`.

**LIRE CECI D'ABORD.** `vercel.json` porte, versionné et délibéré :

```json
"git": { "deploymentEnabled": { "master": false } }
```

Un `git push master` ne déclenche donc **aucun** déploiement. C'est ce qui a laissé la
production **19 h en retard de 655 commits** (23/08/2026) sans que rien ne le signale.
Toute mise en production de SmartDataPay passe désormais par un deploy CLI explicite.
Ne pas rallumer ce réglage sans une décision de Rose : il a été posé exprès.

1. Committer **SES fichiers uniquement** (l'arbre contient des modifs d'autres sessions) :
   `git fetch origin master && git rebase --autostash origin/master` puis `git push`.
2. Appliquer le GARDE-FOU UNIVERSEL, et déployer depuis un arbre **propre** au SHA exact
   (jamais depuis l'arbre de travail encombré) :

```bash
MSYS_NO_PATHCONV=1 npx vercel deploy --prod --yes --archive=tgz --env DEPLOIEMENT_SHA=$(git rev-parse HEAD)
```

   - **`--archive=tgz` OBLIGATOIRE** (sinon « files should NOT have more than 15000 items »,
     à cause des `.claude/worktrees/` qui gonflent à 30 000+ fichiers).
   - **`--env DEPLOIEMENT_SHA=…` OBLIGATOIRE.** Un deploy CLI par archive ne porte aucune
     métadonnée git : sans cette option, `/api/version` renvoie `commit: null` et **on ne
     peut plus prouver quel code tourne**. La vigie `deploiement-a-jour` le détecte et
     alerte — l'oubli ne passe pas inaperçu, mais autant ne pas le faire.
   - ⚠️ **`--env` (par déploiement), JAMAIS une variable de projet.** Une variable de projet
     reste figée d'un déploiement à l'autre et finit par annoncer un commit qui ne tourne
     plus : c'est l'erreur commise sur DataPaie, où `/api/health` a menti pendant des jours.
3. Si des sessions concurrentes poussent en même temps : re-vérifier `git ls-remote origin master`
   AVANT de déployer, et déployer le VRAI HEAD. Ne jamais déployer un ancêtre.

### B. DataPaie (prod figée par CLI — hotfix chirurgical recommandé)

Projet `prj_xTOiuksOWTIkZ7drcovkHsP47bf8`, domaine `logiciel.datapaie.com`. Un `git push` crée surtout des **PREVIEW** ; la PROD n'est fixée que par un `vercel deploy --prod` explicite.

**Hotfix chirurgical** (déployer 1 correctif sans embarquer les chantiers inachevés des autres sessions présents dans l'arbre partagé) :
1. Trouver le commit prod actuel via MCP Vercel `list_deployments` (`target:"production"` le plus récent).
2. `git worktree add --detach <chemin-hors-projet> <commit-prod>` (copie ISOLÉE).
3. `git -C <worktree> cherry-pick <commit-du-correctif>` — vérifier `git diff <commit-prod> --stat` = SEULEMENT les fichiers voulus.
4. Copier `.vercel/` (gitignoré) dans le worktree.
5. **Capturer l'identité de déploiement** (OBLIGATOIRE depuis le fix « /api/health ment ») :
   `cd <worktree> && node scripts/generate-deployment-sha.mjs --capture`
   → écrit `deployment-sha.json` (gitignoré, force-inclus dans l'archive) avec le HEAD du worktree.
   Sans cette étape, le prebuild REFUSE le build de production (fail-loud voulu : sinon
   `/api/health` afficherait un SHA faux et le canari prod comparerait un mensonge).
6. `vercel deploy --prod --yes --archive=tgz` → la prod actuelle n'est PAS touchée tant que le build n'a pas réussi.
7. `git worktree remove <worktree> --force`.

⚠️ La variable d'env Vercel `DEPLOYMENT_SHA` (posée le 23/07/2026, scope Production) est un
repli LEGACY figé — elle a déjà menti (31/07 : prod servait af3895cb, health disait 8d189728).
Le SHA vrai est désormais cuit dans le bundle au prebuild ; cette variable peut être supprimée
du projet Vercel (décision Rose). Si `/api/health` renvoie `deploymentShaSource:"env"`, c'est
que l'identité n'a PAS été capturée au deploy.

**Pièges DataPaie à vérifier AVANT le build :**
- **Lockfile frozen** : Vercel installe en `--frozen-lockfile`. Toute dépendance ajoutée à `package.json` sans régénérer `pnpm-lock.yaml` casse le build (`ERR_PNPM_OUTDATED_LOCKFILE`) — et casserait la prod. Vérif : `grep <dep> pnpm-lock.yaml` doit matcher `package.json`. Fix additif : `npx --no-install pnpm install --lockfile-only`.
- **Scope des variables d'env** : une var d'env ne s'applique **qu'au prochain déploiement** ET il faut viser le **bon scope** (Production ≠ Preview/Development). Symptôme d'un mauvais scope : prod reste en 500 après deploy. `DATABASE_URL` prod est « sensible » → illisible via `vercel env pull` (revient `""`).
- Diagnostic panne : comparer login **local vs prod** (même 500 = panne globale BDD) + `get_logs` Postgres Supabase + `get_runtime_logs` Vercel.

### C. Blog paie

Projet `blog-paie`, `.vercel/project.json` présent. Le build lance `scripts/build-vercel.mjs` → `sync-articles-from-db.mjs` (lit `DATABASE_URL`) → `vite build`.
Déploiement : `vercel deploy --prod`. ⚠️ Le corps des articles est **inliné dans le bundle** (3 copies hardcodées possibles) — après une modif d'article, vérifier que le bundle prod ne contient plus l'ancien contenu.

---

## PREUVE EN PROD (obligatoire — sinon ce n'est pas « déployé »)

Ne jamais dire « c'est en ligne » sans l'avoir vérifié pour de vrai :

1. **Quel commit est réellement live** : `npx vercel inspect <domaine-prod>` résout vers l'`id`/url du déploiement qui SERT la prod. Croiser avec MCP `list_deployments` (`state: READY, target: production`). Pour SmartDataPay, croiser AUSSI avec `curl https://www.smartdatapay.app/api/version` : `commit` doit valoir le SHA déployé et `origine` doit valoir `git` ou `ligne-de-commande` — `hors-git` signifie que `--env DEPLOIEMENT_SHA` a été oublié, donc que **l'identité du code en ligne n'est pas prouvée**. Pour DataPaie, croiser AUSSI avec `curl https://logiciel.datapaie.com/api/health` : `deploymentSha` doit être le SHA déployé et `deploymentShaSource` doit valoir `build` (deploy CLI) ou `vercel-git` — `env` = identité non prouvée (variable figée legacy).
2. **Confirmer** que le SHA live == `git ls-remote origin <branche>`.
3. **Réponse HTTP** : `curl` une route publique de prod (SmartDataPay : `/api/smart-documents/search-entreprise?q=...`). 200 = vivant ; 401 sur une route protégée = serveur OK (auth requise).
4. Distinguer clairement « code écrit / poussé » ≠ « prouvé en prod ».

Preview protégé par SSO (répond 401 aux visiteurs non connectés) → lien ouvrable via MCP `get_access_to_vercel_url` (token `?_vercel_share=` valable ~23 h).
