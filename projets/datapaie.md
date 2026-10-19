# DataPaie

[← Index des projets](README.md)

## Description

Logiciel de paie (production : logiciel.datapaie.com), DSN, migration depuis OpenPaye.

## Statut

Très actif (105 sessions, environ 130 worktrees, activité le 19/10/2026). Mise en ligne uniquement avec validation de Rose.

## Chemins locaux (PC Windows)

- `Downloads\Python\logiciel-paie-datapaie`
- `Ancien chemin probable : C:\Users\roses\Downloads\logiciel-paie (encore visé par des tâches)`

## Dépôts GitHub connus

- [datapaie-support](https://github.com/rose0110/datapaie-support) *(à confirmer)*
- [dsn-reforme-2026](https://github.com/rose0110/dsn-reforme-2026) *(à confirmer)*
- [dpae-api-docs](https://github.com/rose0110/dpae-api-docs) *(à confirmer)*

## Outils

Claude + Codex

## Automatisations liées

- audit-dsn, code-review, extraction-ccn, smic-check, veille-ccn, meta-agent (pointent vers l'ancien chemin — à vérifier)
- lecture-retours-dsn, verif-alerte-dsn-rejetee-alpine-semal
- Codex : retours DSN et relevé OpenPaye, suivi retour DPAE test
- Suivi Codex sur VPS

## Prochaines étapes

- [ ] Chantier « Indemnité de fin de CDD » (CHANTIERS.md du 12/10)
- [ ] Post LinkedIn mensuel sur l'avancement
- [ ] Vérifier la fin de la migration OpenPaye → DataPaie vague 1 (19 dossiers, interrompue en juillet)
- [ ] Statut DPAE test (retour « nature 11 ») et « 5 retours DSN manquants »
- [ ] Tests de non-régression automatisés (voir chantiers transverses)
- [ ] Nettoyer les ~130 worktrees

## Contacts / clients

Clients migrés depuis OpenPaye (liste non connue)

## À compléter

- Fichiers de référence : CLAUDE.md, PROJECT-HANDOFF.md, CHANTIERS.md (dans le dépôt)
- Sujets « Candidat unique de mise en vente » et « P0 paie / sécurité / RGPD avant vente » : rattachement à confirmer
- Accès : voir [acces/](../acces/README.md) (aucun secret ici)
- Dernière mise à jour de cette page : 19/10/2026 (inventaire initial)


## Reprendre ce projet

*Section ajoutée le 19/10/2026 pour la continuité (voir [continuite.md](../continuite.md)). Lire d'abord [les manières de travailler de Rose](../guides/manieres-de-travailler-rose.md). Aucun secret ici.*

### Où est le code
- Dossier local (PC Windows de Rose) : `C:\Users\roses\Downloads\Python\logiciel-paie-datapaie`
- Dépôt distant : https://github.com/rose0110/logiciel-paie-datapaie.git

### Stack technique
TypeScript, React + Vite (client), serveur Express + tRPC (`server/_core`), Drizzle ORM, Supabase/PostgreSQL, Vercel (région cdg1, crons : dispenses, beta, DPAE), agents VPS pour DPAE / téléprocédures (`services/`). pnpm.

### Lancer en local
`pnpm install` puis `pnpm dev` (lance `tsx watch server/_core/index.ts` après génération de la base de connaissances). Variables dans `.env` (pas de `.env.example` trouvé à la racine).

### Tester
`pnpm check` (TypeScript), `pnpm test` (Vitest), `pnpm test:e2e` (Playwright). **Obligatoire pour tout chiffre de paie : méthode des 4 gates** (moteur → juriste-paie → testeur-qa indépendant au centime → figement dans `scripts/ebook/FIGES.md`). Harnais de non-régression : `npx tsx --env-file=.env scripts/ebook/run-cas.ts` (sur la branche `fix/audit-2026-07-02`), doit être vert après tout merge touchant le moteur. CI directe sur `atelier-paie-ci` (VPS).

### Déployer / mettre en ligne
Vercel (`vercel --prod`, build `pnpm run prebuild && pnpm run build`). **Mise en ligne UNIQUEMENT avec validation de Rose.** Trois points d'arrêt obligatoires : (1) déploiement prod, (2) écriture/migration sur la base de PROD (préparer + prouver en dry-run, sans appliquer), (3) merge/push sur `main`. Jamais de déploiement sans harnais vert + test unitaire au centime du bug corrigé.

### Services externes
Vercel, Supabase/PostgreSQL, S3 (AWS SDK), net-entreprises / URSSAF (DPAE, DSN via agents VPS), OpenPaye (migration), ELENET / KALI / BOSS / Légifrance (sources), VPS `atelier-paie`.

### Variables d'environnement (noms seulement)
Pas de `.env.example` à la racine : liste des noms **À compléter** (à extraire du code, `process.env.*`, et des variables du projet Vercel). Valeurs : **demander à Rose / coffre-fort** (jamais dans ce wiki ni dans Git)

### Chantiers en cours
- Pas de `CHANTIERS.md` ni de `PROJECT-HANDOFF.md` à la racine de la branche locale actuelle (`chantier/cloture-prod-20260720`) : ils existent probablement sur d'autres branches/worktrees (≈130 worktrees `datapaie-*`, `logiciel-paie-datapaie-*` dans `Downloads\Python`).
- Voir « Prochaines étapes » plus haut (indemnité de fin de CDD, migration OpenPaye vague 1, DPAE test, retours DSN, nettoyage des worktrees).

### Règles de travail de Rose pour ce projet
`CLAUDE.md` du projet :
- **Le modèle ne calcule jamais un montant de tête** : les chiffres sortent du moteur via fixtures isolées.
- Aucun taux/plafond/barème en dur : table `constantes_legales` datée.
- Tout écart moteur/référence = bug moteur (cas chiffré reproductible) ou erreur de la référence (documentée dans CORRECTIONS.md), jamais « à peu près ».
- Sessions de correction : **autonomie jusqu'au bout** (investigation → code → tests au centime → revue du diff → harnais → PR), sans demander « je continue ? ». Seuls arrêts : prod, base de prod, `main`.
- Ne jamais écrire à net-entreprises ou à un organisme pour trancher un doute : utiliser les sources (règle 29).

### Derniers commits (au 19/10/2026)
Branche locale actuelle : `chantier/cloture-prod-20260720` (attention : ce n'est pas forcément la branche de production)

- dc418807 2026-08-26 fix(worktree): remplacer mklink par un script de jonction sûr
- a682b270 2026-07-21 chantier: preuve FRAÎCHE isolation 2 tenants (94/94 runtime sur code déployé, DB éphémère)
- fcf87c64 2026-07-21 chantier: PRODUCTION DÉPLOYÉE — 27 migrations + backfill en prod, #135 mergée, vercel --prod live
- 63b53506 2026-07-21 docs(recap): verdict PRÊT PROD — GO sécurité, reste 2 feux Rose (merge #135 + deploy)
- 9cce6368 2026-07-21 chantier(verdict): GO sécurité (4 passes) + PR #135 draft prête, reste 2 feux Rose

### Ce qui manque encore à un successeur
- Branche de production et dernier état de `main` : la branche locale date de juillet/août, À compléter avec `git fetch` + `git log origin/main`.
- Liste des variables d'environnement : À compléter.
- PROJECT-HANDOFF.md / CHANTIERS.md à jour : à localiser (worktrees).
- Ancien chemin `Downloads\logiciel-paie` n'existe plus : les tâches planifiées qui le visent sont cassées.
