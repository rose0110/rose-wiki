# Automatisations

[← Accueil](../README.md)

Inventaire au 19/10/2026. Légende : ⚠️ obsolète probable · 🔁 doublon / recoupement · ⏸️ en pause · 📅 ponctuelle à date passée.

## Tâches planifiées Claude (31)
| Tâche | Projet | Remarque |
|---|---|---|
| asteren-retours-recette-du-matin | Asteren | |
| audit-complet-ccn-une-nuit | Vigie CCN | 🔁 |
| audit-dsn | DataPaie | ⚠️ vise l'ancien chemin `Downloads\logiciel-paie`, non modifiée depuis le 11/03 |
| ccn-veille-check | Vigie CCN | 🔁 |
| code-review | DataPaie | ⚠️ ancien chemin |
| controle-maj-hebdo-ccn | Vigie CCN | 🔁 |
| envoi-reponse-alicia-berceaux | Berceaux | 📅 |
| extraction-ccn | Vigie CCN / DataPaie | ⚠️ ancien chemin · 🔁 |
| formation-dernier-bloc | Formations | 📅 reprise après quota |
| lecture-retours-dsn | DataPaie | 🔁 avec Codex « retours DSN » |
| maintenance-indemnites-ccn-hebdo | Vigie CCN | ⏸️ depuis le 09/10 · 🔁 |
| meta-agent | ? | ⚠️ ancien chemin |
| paraf-101-alerte-rose-soir | Paraf | |
| paraf-101-relance-midi | Paraf | |
| rangement-sessions | Général | Chaque jour, archive sans supprimer (probable cause des dates « 11/10 ») |
| rappel-manus-avant-23-aout | ? | 📅 23/08 |
| rappel-reecriture-fiches-ccn | Vigie CCN | Prévue le 01/12/2026 |
| relance-vague1-migration | DataPaie | 📅 reprise après quota |
| reprise-controle-v2-indemnites | Vigie CCN | 📅 reprise après quota |
| resync-syntheses-ccn-hebdo | Vigie CCN | ⏸️ remplacée par le VPS |
| resync-syntheses-ccn-nuit | Vigie CCN | ⏸️ remplacée par le VPS |
| smic-check | DataPaie | ⚠️ ancien chemin |
| suivi-emails | Plateforme de pilotage | |
| suivi-facteur | Plateforme de pilotage | |
| surveillance-ventes-livres | Ebook / SmartDataPay ? | Toutes les heures |
| veille-ccn | Vigie CCN | ⚠️ ancien chemin · 🔁 |
| veille-wiki-openpaye | API OpenPaye | Chaque lundi |
| verif-alerte-dsn-rejetee-alpine-semal | DataPaie / Innov'Paie | 📅 probable |
| verif-facturation-16-octobre-2026 | Innov'Paie | 📅 |
| verif-forwarding-facture-longuemart-juin | ? | 📅 12/06 |
| visite-creche-alicia-ismael | Berceaux | 📅 22/09 |

*(L'inventaire annonce 31 tâches ; la liste ci-dessus en compte 31 noms.)*

## Automatisations Codex (16)
| Automatisation | Projet | Remarque |
|---|---|---|
| C13 (progression de nuit) | ? | à documenter |
| codex-worker-ccn-c13-preview | Vigie CCN | 🔁 |
| Mémoire du PC (contrôle et nettoyage) | Général | |
| Vidéos Micro-Crèche | Micro-Crèche Facile | |
| Publications Berceaux | Berceaux | |
| Réception veille VPS Micro-Crèche SEO | Micro-Crèche Facile | 🔁 avec SEO continu |
| SEO continu Micro-Crèche | Micro-Crèche Facile | 🔁 |
| SEO hebdomadaire Blog | Blog Paie | 🔁 (à regrouper) |
| SEO hebdomadaire Déclaration AT | Déclaration AT | 🔁 |
| SEO hebdomadaire Paraf | Paraf | 🔁 |
| SEO hebdomadaire Portelys | Portelys | 🔁 |
| Suivi retour DPAE test | DataPaie | Statut inconnu (en attente « nature 11 ») |
| Retours DSN et relevé OpenPaye | DataPaie | 🔁 avec lecture-retours-dsn |
| Veille CCN OpenPaye | Vigie CCN / API OpenPaye | 🔁 |
| Veille référentiel paie | Vigie CCN / SmartDataPay | 🔁 |
| Veille YouTube Micro-Crèche | Micro-Crèche Facile | |

## Skills Claude (22)
assistant-a-jour, capsules-live, chantier, contrat-travail, deploy-vercel-sur, design-produit, ecran, impeccable, interrogatoire, mail-perso, new, paraf, refonte-ccn, rgpd, routage, seo-performance, telerc, test-app, veille-ccn-kali, vigie, voix-rose.

*(Annoncé 22 ; 21 noms listés dans l'inventaire — à compléter.)*

## Commandes
`/audit`, `/prod`, `/simple`.

## Plans
6 fichiers (mai à juillet 2026) dans `.claude\plans`.

## Points d'attention
- **Ancien chemin** : 6 tâches (audit-dsn, code-review, extraction-ccn, smic-check, veille-ccn, meta-agent) visent `C:\Users\roses\Downloads\logiciel-paie` au lieu de `Python\logiciel-paie-datapaie`. Vérifier si elles tournent pour rien.
- **Veille CCN** : une dizaine de tâches Claude et Codex se recoupent → consolider (voir [chantiers transverses](../suivi/chantiers-transverses.md)).
- **SEO** : 5 automatisations quasi identiques → une seule avec rapport commun.
- **Ponctuelles passées** : vérifier puis archiver.
