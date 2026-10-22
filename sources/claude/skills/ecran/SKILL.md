---
name: ecran
description: Charge le standard d'interface de Rose (`~/.claude/STANDARD-ROSE-UX.md`) et impose son contrôle d'ergonomie. À invoquer dès qu'on construit, refond, critique ou corrige un écran, une page, un tableau de bord, un formulaire, un composant, une liste, un menu — ou un document mis en page (devis, proposition, rapport, présentation). Vaut aussi quand on ajoute une notion à une interface existante (une échéance, un statut, une date), quand Rose dit qu'un rendu est « trop chargé », « mal réparti », « pas joli », « pas cohérent », ou quand un chantier touche au front. Marche dans TOUS les projets.
---

# Le standard d'interface de Rose

## Avant de coder — deux lectures, toujours

1. **`C:\Users\roses\.claude\STANDARD-ROSE-UX.md`** — les 9 règles, appuyées sur les
   corrections que Rose a réellement données entre avril et août 2026. C'est l'autorité sur
   ses préférences : quand un doute apparaît, c'est la citation datée qui tranche.
2. **Les écrans voisins et la charte du projet courant** (CLAUDE.md du projet, mémoire,
   DESIGN.md, composants canoniques s'ils existent). Le standard dit *comment on construit* ;
   il ne dit JAMAIS quelles couleurs — « chaque projet a son identité » (Rose, 11/07/2026).
   Ne jamais importer l'identité d'un projet dans un autre.

Un skill de design générique (`impeccable`, `frontend-design`) reste utile pour l'exécution.
Sur les points où Rose a tranché, c'est le standard qui prime.

## Avant de coder — la carte des surfaces

Si la tâche **ajoute une notion** à une interface existante (une échéance, un statut, une
date, un filtre), lister d'abord toutes les surfaces où elle doit vivre, puis les cocher une
par une :

> liste · fiche de détail · création · modification · calendrier · filtre · tri · recherche ·
> export · notification · tableau de bord · menu · mobile

C'est le défaut le plus coûteux et le plus récurrent (règle 6 du standard) : la notion posée
à certains endroits et pas à d'autres. La liste cochée fait partie du livrable.

## Construire

Pas de méthode imposée : organise-toi comme tu veux. Ce qui est attendu à la fin est décrit
ci-dessous.

## Le contrôle — il fait partie de « terminé »

**Sept points se mesurent**, et ils ont un juge. Il est rapide : le relancer autant de fois
qu'on veut PENDANT le travail, pas une seule fois à la fin.

```powershell
Push-Location "C:\Users\roses\.claude\skills\test-app\runner"
node ergo-check.mjs --url "<URL>" --name "<slug>"
Pop-Location
```

Code de sortie 0 = vert, 1 = rouge. Options utiles : plusieurs `--url` pour comparer les
écrans entre eux (règle 4), `--terme "échéance"` pour vérifier qu'une notion est bien sur
chaque surface (règle 6), `--type dashboard|landing` quand les cartes en en-tête sont
légitimes, `--mobile`, `--auth <fichier>.json`. Détail des options dans le skill `test-app`.

1. Tous les espacements sont dans l'échelle 4 / 8 / 16 / 24 / 32 / 48
2. Sur chaque bloc, espace externe ≥ espace interne
3. Aucune cible cliquable sous 24 × 24 px
4. Réponse sous 400 ms sur les interactions locales
5. La notion ajoutée est présente sur chacune des surfaces listées plus haut
6. Les écrans voisins partagent en-tête et composants canoniques
7. Pas de défilement horizontal ; les groupes tiennent en écran étroit

**Quatre points se regardent**, sur captures — en ouvrant vraiment les images :

8. Le contenu utile commence-t-il haut, sans carte ni bandeau qui le repousse ?
9. Les espaces sont-ils répartis, ou y a-t-il du vide d'un côté et du tassement de l'autre ?
10. L'écran ressemble-t-il à ses voisins ?
11. Est-ce que ça donne envie, ou est-ce que ça sent le gabarit généré ?

**Aucune action existante ne se perd** dans une refonte : inventorier ce que l'écran permet
avant, rejouer l'inventaire après.

## Livrer

- Les captures, et les mesures des points 1 à 7.
- **Dire ce qui n'a pas été regardé.** « J'ai écrit le code » n'est pas « j'ai vu le rendu ».
  Ne jamais conclure sur l'ergonomie sans avoir ouvert les images.
- Signaler les incohérences repérées en chemin, même hors consigne, avec une proposition.

## Après une correction de Rose

Toute nouvelle correction d'interface va **dans le standard**, avec sa phrase et la date —
pas dans une mémoire de projet, où elle serait invisible depuis les autres projets. C'est ce
qui empêche le même défaut de revenir ailleurs trois semaines plus tard.
