---
name: test-app
description: >-
  Teste et AUDITE une app web (ou un site) en pilotant un vrai navigateur avec
  Playwright. Détecte les bugs fonctionnels ET les problèmes d'ergonomie / design
  que l'IA ne voit pas quand elle code : éléments disproportionnés (ex. cadre de
  signature géant), fonctionnalité ajoutée en énième entrée de menu au lieu d'une
  option logique, trop de boutons, navigation lourde, doublons de catégories,
  bugs d'affichage, version mobile cassée, erreurs console/JS, liens et images
  cassés. Produit une vidéo .webm de la session + un rapport HTML avec
  screenshots. Réutilisable sur toutes les apps. Windows. À utiliser dès que Rose
  veut "tester", "auditer", "vérifier" une app/un site, ou demande un regard
  critique sur l'ergonomie.
---

# Test & Audit UX d'une app — skill réutilisable

## Quand utiliser cette compétence

Dès que Rose veut **tester ou auditer une de ses applications** (logiciel de
paie, signature électronique, CRM, site vitrine…). Le skill ne se limite PAS au
fonctionnel ("est-ce que le bouton marche ?") : il porte **l'œil critique** que
Rose a naturellement quand elle ouvre une app, mais que l'IA n'a pas quand elle
la code — proportions, architecture de l'information, lourdeur, cohérence.

Cas concrets visés (exemples vécus par Rose) :
- un **cadre de signature disproportionné** qui mange la moitié de l'écran ;
- une fonctionnalité demandée qui est **rajoutée comme un énième menu** au lieu
  d'être une option logique d'une fonctionnalité existante ;
- **trop de boutons**, navigation profonde, appli qui paraît lourde ;
- **doublons** de catégories / libellés, menu dans le menu.

## Philosophie : mesure déterministe + œil critique de Claude

Deux étages, jamais confondus (RÈGLE N°1 — honnêteté sur les vérifications) :

1. **MESURÉ automatiquement** par `runner/qa-runner.mjs` (déterministe, factuel) :
   erreurs console/JS, requêtes réseau en échec, liens cassés (statut HTTP),
   images cassées, débordement horizontal, éléments candidats "disproportionnés"
   (ratio mesuré vs écran), cibles tactiles < 32 px, doublons de menu, densité de
   boutons, champs sans label, hiérarchie de titres.

2. **JUGÉ à l'œil par Claude** : Claude **OUVRE réellement chaque screenshot**
   (outil Read sur les .png — il voit l'image) et **regarde la vidéo si besoin**,
   puis applique la grille ci-dessous. C'est ici qu'on tranche : ce cadre
   est-il *vraiment* gênant ? ce menu est-il *mal* placé ? l'appli est-elle
   *trop* chargée ?

Dans le rapport, **toujours étiqueter** chaque constat : `[mesuré]` ou `[jugé à
l'œil]`. Et lister ce qui **n'a pas été testé** (pages derrière auth non
fournie, parcours non couverts). Ne jamais présenter un signal auto comme un
audit de fond, ni l'inverse.

## Le juge d'ergonomie — `ergo-check.mjs` (rapide, vert/rouge)

`qa-runner.mjs` est la passe complète : vidéo, screenshots, crawl, rapport. Elle est
lente, on la lance une fois. **`ergo-check.mjs` est le juge rapide**, à relancer autant
de fois qu'on veut PENDANT le travail. Il mesure les 7 points mesurables de
`C:\Users\roses\.claude\STANDARD-ROSE-UX.md` et **sort en code 1 si c'est rouge**.

```powershell
Push-Location "C:\Users\roses\.claude\skills\test-app\runner"
node ergo-check.mjs --url "<URL>" --name "<slug>"
Pop-Location
```

Options : `--url` répétable (compare les écrans entre eux) · `--mobile` ·
`--type liste|dashboard|landing` (par défaut `liste` ; sur `dashboard`/`landing`, les
cartes en en-tête sont tolérées) · `--terme "échéance"` (vérifie qu'une notion est
présente sur chaque surface — règle 6) · `--auth fichier.json` ·
`--interact "<sélecteur>"` (latence < 400 ms ; **opt-in**, pour ne jamais cliquer un
bouton destructeur) · `--headed` · `--seuil-haut <px>`.

**Bloquants** (rouge) : cibles sous 24×24 px trop rapprochées (échec WCAG 2.5.8) ·
débordement horizontal · padding interne > écart au voisin · contenu utile qui commence
trop bas · notion absente d'une surface · en-tête différent d'un écran à l'autre ·
latence > 400 ms.
**Avertissements** : espacements hors échelle, trop de valeurs distinctes, petites cibles
sauvées par l'espacement.

**Le juge a lui-même son test.** Après toute modification de `ergo-check.mjs`, relancer :

```powershell
node ergo-selftest.mjs
```

Il rejoue 7 cas contre deux écrans figés dans `fixtures/` — `ecran-fautif.html` (4 fautes
plantées, doit sortir ROUGE) et `ecran-conforme.html` (doit sortir VERT, aucun faux
positif). **Ne jamais « corriger » ces deux fixtures** : le fautif doit rester fautif.

⚠️ **Un `ergo-check` vert n'est PAS un audit d'ergonomie.** Il ne dit rien sur « est-ce
joli », « est-ce cohérent », « est-ce que ça donne envie » — ces 4 points se REGARDENT sur
captures. Le script les liste lui-même en « NON MESURÉ » : les reprendre tels quels dans le
rapport, et dire lesquels ont été réellement regardés.

## Prérequis (une seule fois, déjà fait sur ce PC)

Playwright + Chromium sont installés dans `runner/`. Pour réinstaller ailleurs :

```powershell
Push-Location "C:\Users\roses\.claude\skills\test-app\runner"
npm install playwright@latest
npx playwright install chromium      # ajouter "webkit" pour simuler Safari/iPhone
Pop-Location
```

## Étapes à suivre

### Étape 1 — Cadrer la cible (action de Rose)
Demander, **une chose à la fois** :
- l'**URL** (localhost:port si en local — vérifier que le serveur tourne — ou
  l'URL en ligne) ;
- a-t-on besoin d'être **connecté** ? (voir § Auth) ;
- **desktop, mobile, ou les deux** ? (par défaut : les deux).

### Étape 2 — Lancer le runner
Depuis le dossier `runner/`. Desktop puis mobile :

```powershell
Push-Location "C:\Users\roses\.claude\skills\test-app\runner"
node qa-runner.mjs --url "<URL>" --name "<slug>"
node qa-runner.mjs --url "<URL>" --name "<slug>" --mobile
Pop-Location
```

Le navigateur s'ouvre **visible** (Rose peut regarder, comme dans la vidéo). Le
runner crawle l'accueil + quelques pages internes, scrolle "à l'humaine",
capture screenshots + vidéo, et écrit `resultats/<runId>/report-data.json`.

### Étape 3 — Lire les preuves
- `Read` le `report-data.json` (tous les signaux mesurés).
- **`Read` CHAQUE screenshot `.png`** un par un — c'est obligatoire : Claude doit
  réellement VOIR les écrans pour juger l'ergonomie. Ne jamais conclure sur
  l'ergo sans avoir ouvert les images.

### Étape 4 — Appliquer la grille d'audit (le cœur, voir plus bas)

### Étape 5 — Classer chaque constat
Badge + sévérité + **recommandation concrète et actionnable** :
- 🔴 **Bug** (cassé : erreur JS, lien mort, image cassée, parcours bloqué)
- 🟠 **Ergonomie** (disproportion, mauvais placement, surcharge, navigation)
- 🟡 **Warning** (console, accessibilité, incohérence mineure)
- 🔵 **Info** (suggestion, point de vigilance)

### Étape 6 — Générer le rapport HTML avec `build-report.mjs`
Écrire d'abord un `findings-<slug>.json` (constats rédigés APRÈS lecture réelle
des captures — schéma documenté en tête de `build-report.mjs`), puis :

```powershell
Push-Location "C:\Users\roses\.claude\skills\test-app\runner"
node build-report.mjs --findings "resultats\findings-<slug>.json" `
  --runs "resultats\<run-desktop>;resultats\<run-mobile>" `
  --out "resultats\rapport-<slug>.html"
Pop-Location
```

Le générateur embarque les screenshots en base64, calcule les métriques depuis
les `report-data.json` et n'invente rien. Thème clair, accent violet.

### Étape 7 — Ouvrir le rapport
```powershell
Start-Process "C:\Users\roses\.claude\skills\test-app\runner\resultats\rapport-<slug>.html"
```

## Grille d'audit ergonomie (à appliquer en regardant les screenshots)

Pour chaque point : le **signal auto** (champ JSON) aide, mais le **jugement** se
fait sur l'image.

**1. Proportions & dimensionnement** — signal : `oversized` (candidats > 45 % de
l'écran).
À l'œil : un élément (cadre de signature, modale, input, carte, image) est-il
hors de proportion avec sa fonction ? Un champ de signature ne devrait pas
écraser le reste. Vérifier desktop ET mobile.

**2. Architecture de l'information & navigation** — signaux : `nav.items`,
`nav.duplicateNavLabels`, `nav.nestedMenus`, `headings`, `h1Count`.
À l'œil : une fonction est-elle exposée comme une **nouvelle entrée de menu**
alors qu'elle serait mieux en **option** d'un écran existant ? Doublons de
catégories ? Menu dans le menu ? Plus d'un `h1` ? Le chemin pour faire l'action
principale est-il évident en < 3 clics ?

**3. Surcharge & lourdeur** — signaux : `controls.interactiveCount`,
`controls.controlDensity`, `controls.buttons`.
À l'œil : trop de boutons visibles d'un coup ? Densité qui fatigue ? Actions
secondaires aussi visibles que l'action principale ? Manque de hiérarchie
(primaire/secondaire) ?

**4. Cohérence visuelle** — (jugement pur).
Styles de boutons hétérogènes, espacements irréguliers, alignements cassés,
tailles de police incohérentes, couleurs hors charte.

**5. Affichage & responsive** — signaux : `horizontalOverflow`, `overflowBy`,
`tinyTargets`, `images.broken`, screenshots `--mobile`.
À l'œil : débordement horizontal, texte tronqué/chevauché, burger mobile
fonctionnel, cibles tactiles assez grandes (≥ 44 px recommandé), rien qui sort
de l'écran.

**6. Accessibilité (base)** — signaux : `images.missingAlt`,
`unlabeledInputs`, `smallText`.
À l'œil : contrastes faibles, texte trop petit, libellés de champs absents.

**7. Technique** — signaux : `console.errors`, `pageErrors`,
`network.badResponses`, `network.brokenLinks`.
Toute erreur JS, requête en échec ou lien mort = 🔴 par défaut.

## Le runner en détail — options

| Option | Effet | Défaut |
|---|---|---|
| `--url <URL>` | **obligatoire** — point de départ | — |
| `--name <slug>` | nom court (fichiers/dossier) | `app` |
| `--mobile` | émule un iPhone 13 (touch) | desktop 1366×900 |
| `--device "<nom>"` | device Playwright précis (ex. `"Pixel 7"`) | — |
| `--max-pages <n>` | nb de pages internes en plus de l'accueil | 6 |
| `--no-crawl` | teste uniquement l'URL donnée | crawl actif |
| `--headless` | navigateur invisible (plus rapide, sans regarder) | visible |
| `--storage-state <f>` | session connectée (voir Auth) | — |
| `--routes "/a,/b,/c"` | écrans à visiter explicitement (SPA sans liens `<a>`) | — |
| `--wait <ms>` | pause "humaine" entre actions | 800 |

Scripts compagnons dans `runner/` :
- **`login-capture.mjs`** — connexion scriptée (`--email`/`--password`, jamais
  stockés) ou manuelle, sauvegarde la session dans un `auth.json`.
- **`discover-links.mjs`** — liste les `<a>` d'une page connectée et, via
  `--click-text "…"`, clique un élément et affiche l'URL d'arrivée (pour
  trouver l'URL d'un écran de détail/éditeur dans une SPA à boutons).
- **`probe-viewport.mjs`** — capture VIEWPORT à une position de scroll donnée,
  pour vérifier les éléments `fixed`/`sticky` (voir Pièges).

Sorties dans `runner/resultats/<runId>/` : `report-data.json`, `screenshots/`,
la vidéo `<runId>.webm`.

## Rapport HTML (à générer à l'étape 6)

Fichier `resultats/<runId>/rapport-<slug>.html`, autonome (CSS inline), avec :
- **Header** : URL testée + date + environnement (desktop/mobile, navigateur).
- **4 métriques** : pages testées / erreurs console / bugs / problèmes d'ergo.
- **Section vidéo** : chemin du `.webm` (lien `file://`) + résumé du parcours.
- **Section constats** : chaque constat avec badge (🔴/🟠/🟡/🔵), étiquette
  `[mesuré]`/`[jugé à l'œil]`, description technique + reco concrète.
- **Section ✅ Ce qui fonctionne** : ce qui a été testé et qui va bien.
- **Section "Non testé"** : périmètre non couvert (auth, parcours…).
- **Section screenshots** : captures embarquées en base64, 2 colonnes
  (lire les .png et inliner en `data:image/png;base64,…`).
- **Footer** : "Généré par Claude Code + Playwright · <date>".

## Tester en étant connecté (auth)

Beaucoup d'apps de Rose (paie, signature) sont derrière un login. Deux options :
1. **Page publique d'abord** : la landing, la page de connexion elle-même
   (parfaitement auditable côté UX), ou une page partagée par lien.
2. **Session enregistrée** : capturer un `storageState` une fois, puis le
   réutiliser. Script ponctuel à lancer dans `runner/` :
   ```js
   // login-capture.mjs : ouvre, laisse Rose se connecter à la main, puis sauve la session
   import { chromium } from 'playwright';
   const b = await chromium.launch({ headless: false });
   const ctx = await b.newContext();
   const p = await ctx.newPage();
   await p.goto(process.argv[2]);              // URL de login
   console.log('Connecte-toi puis reviens ici…');
   await p.waitForTimeout(60000);              // 60 s pour se connecter
   await ctx.storageState({ path: 'auth.json' });
   await b.close();
   ```
   Puis : `node qa-runner.mjs --url "<URL_privée>" --name app --storage-state auth.json`.

## Pièges connus

- **Éléments `fixed`/`sticky` mal placés dans les captures pleine page** : une
  barre d'action `position:fixed` apparaît au milieu de l'image et « masque »
  du contenu — c'est un ARTEFACT, pas forcément un bug. Toujours re-vérifier
  avec `probe-viewport.mjs` (capture viewport au bon scroll) avant de rapporter
  un chevauchement. Vécu sur Paraf (faux chevauchement écarté).
- **Squelette/spinner infini ≠ page cassée définitivement** : le blocage peut
  être INTERMITTENT (requête pendante sans retry). Sonder le même écran une 2e
  fois (desktop + mobile) avant de conclure « cet écran est cassé » vs « le
  chargement est intermittent » — les deux constats sont différents. Vécu sur
  Paraf (admin/doc bloqués en desktop mais OK en mobile, et inversement).
- **SPA naviguant 100 % par boutons (zéro `<a>`)** : le crawl ne trouve rien.
  Récupérer les routes dans le code source (router de l'app) et les passer via
  `--routes`, + `discover-links.mjs --click-text` pour les URLs de détail.
- **Audit d'un espace connecté = lecture seule** : exclusions de crawl
  (logout, delete, supprimer, remove, archive…) déjà dans le runner ; ne
  jamais cliquer Sauvegarder/Envoyer pendant un audit ; le dire dans la
  méthodo du rapport.
- **Capture > 16 384 px = image corrompue** (limite de texture Chromium) : le
  contenu se répète en bandes dans le screenshot pleine page. Le runner force
  `deviceScaleFactor: 1` pour rester sous la limite. **Avant de rapporter un
  « contenu dupliqué », toujours croiser avec le DOM** (`h1Count`, headings du
  JSON) : si le DOM est unique, c'est un artefact de capture, pas un bug du
  site. Vécu sur l'audit Paraf (faux positif évité).
- **SPA : les ancres `/#section` sont la même page** — le runner déduplique
  (hash ignoré, slash final normalisé). Vérifier le champ `url` final de chaque
  page du JSON : s'il diffère de l'URL demandée, c'est une **redirection** (ex.
  route protégée → /login), souvent un constat intéressant en soi.
- **Windows** : pas de `/tmp`. Tout va dans `runner/resultats/`. Ouvrir un
  fichier avec `Start-Process`, pas `open`. Chemins entre guillemets.
- **Serveur pas lancé** : si l'URL localhost ne répond pas, le runner échoue —
  vérifier d'abord que le `npm run dev` tourne (cf. mémoire `reference_dev_servers`).
- **`oversized` = candidats, pas verdicts** : la liste signale des éléments
  larges ; c'est Claude qui tranche à l'œil s'ils sont *vraiment* disproportionnés.
- **Crawl borné** : seules `--max-pages` pages internes sont visitées (les
  `logout` et fichiers sont ignorés). Le dire dans la section "Non testé".
- **SPA / lazy-load** : le runner scrolle pour déclencher le lazy-load, mais
  certains contenus n'apparaissent qu'après interaction — à compléter à la main
  si besoin.

## Extensions futures (quand le v1 est validé)

- **Multi-navigateurs** : `npx playwright install webkit` puis `--device
  "iPhone 13"` réel sous WebKit pour reproduire les bugs Safari/iPhone.
- **Mode batterie / CI** : enchaîner un jeu de parcours fixes à chaque déploiement.
- **Sous-agents en parallèle** : un agent par fonctionnalité pour aller plus vite
  sur les grosses apps.
- **Parcours scénarisés** : fichier de steps (remplir tel formulaire, cliquer
  tel bouton) pour tester des fonctionnalités précises de bout en bout.
