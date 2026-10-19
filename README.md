# Wiki de Rose SONGUE — base de connaissances centrale

## À quoi sert ce wiki
C'est le « second cerveau » de Rose : un seul endroit pour retrouver chaque projet, son dépôt, ses automatisations, ses prochaines étapes et ses contacts. Objectifs :
- ne rien oublier ;
- permettre à un collaborateur de reprendre le travail si Rose est indisponible.

Contenu initial tiré de l'inventaire du 19/10/2026 (sessions Claude Code et Codex). Les informations incertaines sont marquées *(à confirmer)* ou listées dans « À compléter ».

**Si Rose est indisponible** : commencer par [continuite.md](continuite.md) (plan de continuité), puis faire lire à toute IA [guides/manieres-de-travailler-rose.md](guides/manieres-de-travailler-rose.md).

## Navigation
| Rubrique | Contenu |
|---|---|
| [continuite.md](continuite.md) | Plan de continuité : quoi lire en premier, règles globales de Rose |
| [guides/manieres-de-travailler-rose.md](guides/manieres-de-travailler-rose.md) | Consignes pour une IA qui travaille au nom de Rose (remarques récurrentes, support, chantiers, UX) |
| [projets/](projets/README.md) | Index et une page par projet |
| [projets/en-sommeil.md](projets/en-sommeil.md) | Projets en sommeil, personnels ou abandonnés |
| [automatisations/](automatisations/README.md) | Tâches planifiées Claude, automatisations Codex, skills, commandes |
| [suivi/a-verifier.md](suivi/a-verifier.md) | Points oubliés ou inachevés à vérifier |
| [suivi/taches-repetitives.md](suivi/taches-repetitives.md) | Tâches répétitives à automatiser |
| [suivi/chantiers-transverses.md](suivi/chantiers-transverses.md) | Chantiers qui touchent plusieurs projets |
| [acces/](acces/README.md) | Où trouver les accès (jamais de secret ici) |
| [conversations/](conversations/README.md) | Résumés des sessions Claude/Codex par projet |
| [templates/projet.md](templates/projet.md) | Modèle de page projet |

## Index rapide
- **Paie / RH (cœur)** : [SmartDataPay](projets/smartdatapay.md) · [DataPaie](projets/datapaie.md) · [Innov'Paie / Automation OpenPaye](projets/innovpaie-automation-openpaye.md) · [API et agent OpenPaye](projets/api-agent-openpaye.md) · [Portail Innov'Paie](projets/portail-innovpaie.md) · [Vigie CCN](projets/vigie-ccn.md)
- **Clients** : [Automatisation Fiona](projets/automatisation-fiona.md) · [Asteren (Pablo)](projets/asteren-pablo.md) · [Berceaux d'à Côté](projets/berceaux-dacote.md) · [Flashpaie](projets/flashpaie.md) · [YSO RH](projets/yso-rh.md)
- **Produits / sites** : [Paraf](projets/paraf.md) · [Micro-Crèche Facile](projets/micro-creche-facile.md) · [Site Smart Data Pay](projets/site-smart-data-pay.md) · [Blog Paie](projets/blog-paie.md) · [Déclaration AT](projets/declaration-accident-travail.md) · [Portelys](projets/portelys.md) · [RoseVideo](projets/rosevideo.md) · [FormaKit](projets/formakit.md)
- **Formation / contenu / événements** : [Challenge IA été](projets/challenge-ia-ete.md) · [Formations SILAE](projets/formations-silae.md) · [Ebook](projets/ebook.md) · [Congrès](projets/congres.md)
- **Pilotage** : [Plateforme de pilotage](projets/plateforme-pilotage.md) · [Bilan](projets/bilan.md)

**Urgent au 19/10/2026** : URL FormaKit à rétablir, accès HR Tech et page exposant (Congrès), demande de réduction OpenPaye (SmartDataPay).

## Comment contribuer
1. Un nouveau projet : copier [templates/projet.md](templates/projet.md) dans `projets/<nom-court>.md`, puis l'ajouter à l'index `projets/README.md`.
2. Mettre à jour la date « Dernière mise à jour » en bas de la page modifiée.
3. Marquer ce qui n'est pas sûr avec *(à confirmer)* plutôt que de le deviner.
4. Cocher les cases `- [ ]` des prochaines étapes quand c'est fait ; déplacer les points résolus de `suivi/a-verifier.md`.
5. **Ne jamais écrire de mot de passe, token, clé API ou identifiant** : voir [acces/](acces/README.md).
6. Messages de commit courts et en français (ex. « DataPaie : maj prochaines étapes »).
