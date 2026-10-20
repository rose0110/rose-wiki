# Décisions

[← Accueil](../README.md)

## 20/10/2026

| # | Sujet | Choix | Raison | Preuve / état |
|---|---|---|---|---|
| Q14 | Scripts inutilisés (**DataPaie**, pas SmartDataPay) | 22 scripts supprimés ; n°13 `seed-ccn-843-boulangerie.mjs` et les 5 dangereux gardés pour plus tard | Nettoyage sans perte d'un seed CCN encore utile ; risque réduit en deux temps | Validé par Rose le 20/10 à 11:54 ; [PR #572](https://github.com/rose0110/logiciel-paie-datapaie/pull/572) ouverte, **non fusionnée** |
| Q15 | Purge NIR (`logiciel-paie-datapaie`) | Historique purgé, `main` = `a7e95275`, protection de branche remise | Incident RGPD (NIR dans l'historique) | Restent : demande GitHub Support (texte prêt, Rose l'enverra), re-clone du PC **sans pull**, PR #125 |
| Q16 | Réduction OpenPaye (C. Exbrayat, AC2E) | Pas de code dans le mail : elle crée son compte et indique sa formule, puis la remise 40 % est appliquée | Choix de Rose (19/10) | Envoyé le 19/10 à 23 h 03 (Paris), Resend `01a155f9-ff00-71d9-8b06-4aa52d9daade` ; en attente de la cliente |
| Q17 | MCP Silae | Gratuit | Décision de Rose | — |
| Q18 | Grilles de salaire affichées | Grilles officielles uniquement | Décision de Rose (fiabilité) | — |
| Q19 | HR Tech (kakemono, visuels, électricité, mobilier) | ~~Clôturé~~ **Rouvert le 20/10 vers 12 h pour le kakemono** : visuels, électricité, mobilier faits ; kakemono non fini | Erreur de clôture : le kakemono n'avait pas de PDF final | Voir ligne « Kakemono » ci-dessous |
| Q20 | Onglet Signalements DPAE | On garde les 4 boutons avec redirection | Option recommandée, non bloquante — **décidé par Fils rouges** | — |
| — | Session EBOOK 2027 (correction travaux publics) | Validée | Décision de Rose, donnée dans la session | Validée le 20/10 |

## 20/10/2026 vers 12 h (décisions de Rose)

| Sujet | Choix | Raison | Preuve / état |
|---|---|---|---|
| Sessions abandonnées ou dépassées | Clôturées (wiki uniquement, sessions non modifiées) : smartdatapay-app (27/09→07/10), Downloads (25/09, 05/10), brave-chandrasekhar-cd4196, competent-varahamihira-a14b01, amazing-pare-d6a1e3, modest-meitner-4a7418, paraf-signature (26/09), Pablo (24/09), scratch-2026-09-22-4c1bb8, scratch-2026-10-06-07a7f3, EBOOK 2027 (deux du 16/10, tailles de texte), blog-paie-rose-yemeli (19/10) ; informatives : optimistic-shaw-984236, modest-elion-f295b8, elegant-newton-705f53, serene-varahamihira-bde0c1, scratch-2026-10-11-f12876, automationopenpaye (08/10, 15/10), berceaux-crm (04/10, 28/09), logiciel-paie-datapaie (04/10, 12/10) | Abandonnées, plus d'actualité (validé par Rose) | Rapport open_loops.py du 20/10 02:38 |
| Voix des vidéos (scratch-2026-09-23-432c1b) | Clôturée | Plus d'actualité | — |
| Kakemono HR Tech (Codex « j-ai-re-u-un-email ») | Rouvert ; direction **B+C** (produit + impact graphique) | Choix de Rose | Rose répond B+C dans la session ; **PDF d'impression reste à faire** (logo, textes, QR fiable, gabarit imprimeur, test QR). Session : `.codex\sessions\2026\10\19\rollout-2026-10-19T17-41-19-01a154d3-….jsonl` |
| Démos transcrites (dreamy-boyd-25052d) | Sortir **toutes** les démos (~11) | Choix de Rose | À lancer dans la session |
| HUP (Automatisation Fiona) | Décision du 09/09 levée : mettre en ligne ce qui est prêt | Choix de Rose | Vérification de sécurité en cours avant déploiement |
| HUP — mots de passe de production | Ne pas changer les mots de passe de production pour l'instant | Décision de Rose (20/10) | — |
