# Plan de continuité — reprendre le travail si Rose est indisponible

*Créé le 19/10/2026. Aucun secret dans ce wiki : les accès se trouvent dans le coffre-fort de Rose (voir [acces/](acces/README.md)). Les valeurs sont à **demander à Rose / coffre-fort**.*

## 1. À lire en premier (dans cet ordre)

1. **Ce fichier** : règles globales et organisation.
2. [guides/manieres-de-travailler-rose.md](guides/manieres-de-travailler-rose.md) : à faire lire à **toute IA** (Claude, Codex…) avant de répondre au support ou de développer au nom de Rose.
3. [projets/README.md](projets/README.md) puis, pour le projet à reprendre, la section **« Reprendre ce projet »** de sa page (code, stack, lancement, tests, mise en ligne, variables, chantiers, derniers commits, manques).
4. Dans le dépôt du projet : `CHANTIERS.md` (file d'attente : ce qui est ouvert, qui agit), puis `PROJECT-HANDOFF.md` (passation détaillée, preuves), puis `CLAUDE.md` / `AGENTS.md` (règles propres au projet).
5. [suivi/a-verifier.md](suivi/a-verifier.md) et [suivi/chantiers-transverses.md](suivi/chantiers-transverses.md) : points inachevés.
6. [automatisations/](automatisations/README.md) : tâches planifiées qui tournent seules (certaines visent des chemins qui n'existent plus).

## 2. Organisation des machines

- **PC Windows de Rose** : poste de pilotage. Le code de presque tous les projets est dans `C:\Users\roses\Downloads\Python\<projet>` (ou `Downloads\Pablo` pour Asteren). Beaucoup de dossiers `*-wt-*`, `datapaie-*`, `sdp-*` sont des **worktrees** (copies de travail) : ne pas les prendre pour le projet principal.
- **VPS** (Hostinger « atelier-smartdatapay », serveur « atelier-paie » pour tout ce qui touche la paie) : les tests lourds, builds et chantiers longs y tournent (règle : le PC de Rose n'est pas une machine de calcul). Accès : coffre-fort.
- Dépôts : majoritairement **github.com/rose0110** ; SmartDataPay est chez l'organisation **Smart-Data-Pay-AI** ; Innov'Paie/automation OpenPaye est sur **GitLab** (rose.songue) ; plusieurs projets n'ont **aucun dépôt distant** (vigie-ccn, openpaye-agent, ELENET, Automatisation Fiona, plateforme-pilotage sur le VPS uniquement) : voir chaque page.
- Déploiement web : surtout **Vercel** (CLI). Bases : Supabase / PostgreSQL, parfois MySQL/TiDB.

## 3. Règles globales de Rose (résumé de ses fichiers d'instructions IA)

Sources : `C:\Users\roses\.claude\CLAUDE.md` (règles 0 à 32), `C:\Users\roses\.codex\AGENTS.md`, `C:\Users\roses\.claude\STANDARD-ROSE-UX.md`. Résumé de haut niveau, sans secret.

**Honnêteté et preuves**
- Ne jamais dire « vérifié », « testé », « terminé » sans l'avoir réellement fait ; distinguer ce qui a été fait automatiquement, vérifié à la main, et **pas** vérifié.
- *Terminé, testé, poussé, intégré, déployé* sont cinq états différents. Un chantier n'est clos qu'en production prouvée (ou abandonné par Rose).
- Une hypothèse n'est pas une conclusion : chercher ce qui enregistre réellement (journaux, base) avant d'expliquer une panne.
- Relire systématiquement son propre code (diff complet) ; se critiquer soi-même sans attendre que Rose trouve les défauts.

**Mises en ligne (trois périmètres)**
1. **Projets de Rose** (SmartDataPay, DataPaie, sites, blog…) : rien ne part en production sans son go. Un go « train » couvre tout un lot (merge + migrations + déploiement + preuve).
2. **Logiciel d'un client déjà en ligne** (ex. HUP pour Fiona) : un bug bloquant se corrige et se met en ligne sans attendre, avec preuve, et Rose est prévenue immédiatement.
3. **Améliorations pour un client** : attendent le go de Rose.
- Depuis le 19/10/2026 (règle 32) : ce que Rose a explicitement demandé peut être mené jusqu'à la production sans redemander, en gardant tous les garde-fous (aucun déploiement partiel, pas d'écrasement d'un déploiement plus récent, preuve en production, rollback prêt).
- Toutes les corrections d'abord, **une seule** mise en ligne. Jamais de brique isolée d'une fonctionnalité incomplète.
- Ce qui est posé en test (variables, volumes, migrations) se pose aussi en production : liste calculée, pas de mémoire.

**Autonomie**
- Tout ce que l'IA ou le collaborateur peut faire, il le fait ; Rose autorise, elle n'exécute pas. Ne pas s'arrêter pour demander « je continue ? ».
- Les actions que seule Rose peut faire : une par une, numérotées.
- Les questions à Rose passent par un formulaire de questions (choix proposés, recommandé en premier), jamais noyées dans un compte rendu.
- Aller au bout d'une fonctionnalité avant la suivante ; ramener Rose vers les chantiers inachevés (file `CHANTIERS.md`).
- Ne jamais inventer un besoin : ce qui n'a pas été demandé (transcriptions, devis) ne se construit pas.

**Métier paie**
- Recherche maximale dans les sources officielles (Légifrance, BOSS, URSSAF, KALI, ELENET) ; jamais de taux ou barème en dur ni de mémoire.
- Un doute se tranche par les sources (jurisprudence comprise), **jamais** en écrivant à net-entreprises ou à un organisme.
- DataPaie : méthode des 4 gates pour tout chiffre de paie.
- Pas d'appel payant à une API IA externe avec les clés des projets pour les traitements massifs.

**Communication**
- Toujours en **français**, langage simple, court.
- Écrits aux clients : factuels, amicaux, jamais vendeurs (« bonne nouvelle » interdit), pas d'explication technique : ce qui a été fait, ce qui n'a pas marché, ce qu'on fait maintenant.
- **Tout email au nom de Rose est montré avant envoi** (destinataires, objet, texte, pièces jointes) et attend son accord explicite.
- Adresse de contact prioritaire de Rose : son adresse pro YSO Conseils (dans le coffre / ses fichiers d'instructions) ; **aucune adresse email publiée** sur ses sites (formulaire de contact).

**Interface (STANDARD-ROSE-UX)** : un écran = une tâche, contenu utile tout en haut, lignes fines plutôt que cartes, explications repliées derrière une bulle ⓘ, cohérence avec les écrans voisins, pas de rendu générique. Détail dans le guide.

**Continuité Claude ↔ Codex** : les sessions ne partagent pas leur mémoire ; tout passe par les fichiers du projet (`PROJECT-HANDOFF.md`, `CHANTIERS.md`), Git et les preuves. Chaque correction de Rose devient une leçon écrite (règle ou garde-fou).

**Sécurité** : jamais de secret dans Git ou dans ce wiki ; données réelles de clients/salariés jamais dans le code, les tests ou les commits ; worktrees Windows : retirer la jonction `node_modules` avant de supprimer un worktree.

## 4. Ce qui reste fragile (à traiter en priorité)

- Projets **sans dépôt distant** (perte possible si le PC tombe) : vigie-ccn, openpaye-agent, ELENET, Automatisation Fiona (dossier), plateforme-pilotage (VPS seul).
- Commits locaux non poussés (ex. smart-data-pay-site `main`).
- Pages où les variables d'environnement restent « À compléter » (DataPaie, Paraf, Innov'Paie, Berceaux, Fiona).
- Coffre-fort : vérifier qu'un successeur y a accès (Vercel, Supabase, Stripe, GitHub, GitLab, VPS, OpenPaye, Resend…).

*Dernière mise à jour : 19/10/2026.*
