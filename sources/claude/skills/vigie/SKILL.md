---
name: vigie
description: Surveillance RÉCURRENTE de la production — les contrôles qui tournent tout seuls, en continu, contre le vrai système en ligne, et qui alertent quand quelque chose se casse ou dérive. À invoquer dès que Rose parle de « tests de prod », « surveillance », « monitoring », « watchdog », « sonde », « alerte », « détecter une régression en prod », « vérifier que ça tourne toujours », ou veut savoir si un dispositif de surveillance existant dit encore la vérité. À NE PAS confondre avec `test-app` (audit ponctuel à la demande), `prod` (une mise en production précise) ni les tests de fin de développement qui tournent en CI sur un diff.
---

# Vigie — la surveillance de production

Réglages tranchés par Rose le 15/08/2026. Ils ne se redemandent pas : ils s'appliquent.

## Étape 0 — Auditer l'existant AVANT d'ajouter quoi que ce soit

Une sonde de plus sur un dispositif qui ment ne sert à rien. Trois questions, dans cet ordre :

**1. Est-ce que ça tourne vraiment ?**
```bash
gh run list --workflow=<fichier>.yml --event=schedule --limit 30 --json createdAt,conclusion
```
Filtrer sur `--event=schedule` : une exécution manuelle réussie masque des planifiées rouges.

**2. Est-ce que ça teste vraiment la PROD ?**
```bash
gh run view <id> --json jobs -q '.jobs[].steps[] | "\(.conclusion)  \(.name)"'
```
Chercher les `skipped`. Une étape conditionnée à un `workflow_dispatch` ne s'exécute jamais
en planifié : le dispositif a l'air vivant et ne contrôle rien.

**3. Est-ce que l'alerte veut encore dire quelque chose ?**
Compter les échecs consécutifs. **Au-delà de 3, l'alerte est morte.**

> Cas réel, 15/08/2026 — SmartDataPay : 30 exécutions planifiées rouges d'affilée sur 7 jours,
> ~4 mails par jour vers `rose.yemeli@`. Les deux étapes qui touchaient la production
> passaient à chaque tour ; c'est une étape **Preview** qui faisait tout basculer au rouge.

## Les quatre familles de contrôles

| Famille | Ce que ça répond | Cadence | Support |
|---|---|---|---|
| **Vie** | « Est-ce que ça répond ? » — health, page clé, 5xx, certificat | 5 min | VPS |
| **Parcours** | « Est-ce qu'on peut s'en servir ? » — connexion → action → résultat, au navigateur | 30 min | VPS, Actions si navigateur propre nécessaire |
| **Justesse** | « Est-ce que c'est JUSTE ? » — cas de référence rejoués, comparés au centime | 1×/jour | VPS |
| **Dérive** | « Est-ce que les chiffres sont normaux ? » — métier et argent | 1×/jour | VPS |

**La famille « justesse » est celle qui manque presque toujours, et c'est la seule qui compte
vraiment sur de la paie.** Un bulletin faux ne fait pas planter la page : il part chez le
salarié. Une surveillance sans elle donne une fausse tranquillité — le dire franchement
plutôt que d'annoncer « c'est surveillé ».

### Ce que couvre la famille « dérive »

**Métier** — les pannes silencieuses qu'aucun test technique ne voit : un client qui ne
produit plus rien ce mois-ci, un volume de bulletins qui s'effondre, une DSN attendue qui
n'arrive pas, un dossier bloqué depuis trop longtemps, une automatisation qui ne tourne plus.

**Argent** — abonnements en échec, factures impayées qui s'accumulent, paiements Stripe qui
ne passent plus, coûts d'API qui s'envolent.

Une dérive se mesure contre un **attendu explicite** (le mois dernier, la moyenne des trois
derniers, le nombre de contrats actifs). Sans attendu, ce n'est pas un contrôle.

## Choix du support — et pourquoi

- **VPS en principal.** Pas de quota, cadence libre, exécution longue possible. Le quota
  GitHub Actions de DataPaie a déjà été épuisé une fois : ne pas y mettre ce qui tourne
  toutes les 5 minutes.
- **GitHub Actions** pour ce qui exige un navigateur propre et jeté, ou des secrets déjà
  posés là. Cadence modérée, jamais sous l'heure.
- **Vercel Cron** pour les sondes courtes côté application. Attention au garde `vercel.json`
  de DataPaie.
- **Hermes** (VPS 82.25.115.199) : ticker actif mais **aucun job**. Démarrer en `--no-agent`
  (watchdog déterministe) — `approvals.cron_mode: deny` refuse les commandes sensibles.
  Réseau vers Postgres bloqué depuis le 27/06, à débloquer avant tout contrôle en base.
- **Tâches planifiées Claude** seulement quand un script ne suffit pas et qu'il faut du
  jugement. Coût par exécution.

## Politique d'alerte

**Immédiat si c'est grave. Sinon, le récap du matin.** Chaque contrôle est classé à l'écriture.

**Grave** = un client est bloqué, ou un montant est faux. Rien d'autre. Ces deux-là partent
tout de suite, nuit et week-end compris.

**Pas grave** = tout le reste, y compris les dérives et les échecs techniques rattrapés.
Ça attend le récap.

**Le récap du matin** — un seul mail par jour : ce qui s'est cassé dans les 24 h, ce qui a été
rattrapé tout seul, ce qui reste ouvert. Pas de mail « tout va bien » : le silence vaut vert.

### Les cinq règles qui empêchent l'alerte de mourir

1. **Un contrôle de prod ne contrôle QUE la prod.** Jamais de Preview, staging ou local dans
   la même alarme. Deux périmètres = deux alarmes, sinon l'une tue l'autre.
2. **Diagnostiquer la pertinence avant d'alerter.** Ne pas crier au loup. *Exemple posé par
   Rose le 27/06 : « DSN non calculée » n'est un problème que si les bulletins sont faits.
   Bulletins pas faits = la paie n'a pas encore été passée, rien à signaler. Dossier sans
   salarié actif = rien à déclarer.*
3. **Alerter sur deux échecs consécutifs, pas sur le premier.** Un réseau qui hoquette n'est
   pas une panne.
4. **Rouge permanent = incident de dispositif.** Au-delà de 3 exécutions rouges sans action,
   mettre le contrôle en quarantaine et remonter **ce fait-là**, pas le symptôme.
5. **Le canal, c'est l'email** vers `rose.yemeli@yso-conseils.com` (décision du 05/06/2026 :
   Rose est saturée par Telegram, le bot incidents dédié est abandonné — ne pas la relancer
   là-dessus). Un mail dit, dans cet ordre : **quoi** est cassé, **depuis quand**, **ce que ça
   empêche**, **le lien vers la preuve**. Aucune trace d'exécution brute dans le corps.

## Qui répare — cadre étendu à tous les projets

Décision de Rose du 27/06/2026, confirmée le 15/08 pour l'ensemble des projets :

- **Correction automatique** de tout ce qui est **interne et rattrapable** : relancer une
  synchro, une génération, un calcul, une file bloquée. C'est l'essentiel des cas.
- **Validation humaine obligatoire** sur l'**irréversible et le sortant** : dépôt DSN à
  l'URSSAF, paiement, envoi client, publication. Ligne ferme — une déclaration transmise ne
  se rattrape pas, et un agent peut se tromper.
- **Traçabilité** : toute correction automatique est journalisée, pour audit et retour arrière.
- Une correction qui échoue deux fois d'affilée ne se retente pas en boucle : elle passe en
  alerte.

## Ce qu'un contrôle de production n'a JAMAIS le droit de faire

- **Aucun envoi externe réel** : DSN, email client, publication, paiement.
- **Compte de test dédié**, jamais celui de Rose ni celui d'un client.
- **Lecture seule par défaut.** Toute écriture doit être rattrapable et tracée.
- **Données synthétiques** pour tout ce qui est créé ; nettoyage après passage.
- Ne jamais fabriquer de charge sur un système que des clients utilisent au même moment.

## La référence — sans elle, ce n'est pas un contrôle

Un contrôle de justesse a besoin d'une **valeur attendue, datée et sourcée** : ce bulletin
vaut 1 234,56 € au 01/2026, parce que <source officielle>. Comparer au centime, montrer la
sortie brute, ne jamais arrondir un écart pour faire passer au vert.

Si aucune référence n'existe, **la construire est la première tâche** — cf. la section
« juge » du skill `chantier`.

## Livrer

- L'inventaire de ce qui est surveillé, **et de ce qui ne l'est pas**. La seconde liste est
  la plus utile : elle dit où on est aveugle.
- La classification grave / pas grave de chaque contrôle, écrite noir sur blanc.
- La preuve que l'alerte part réellement : **la déclencher une fois pour de vrai.**
- **Casser volontairement quelque chose pour vérifier que la vigie le voit.** Tant qu'un
  dispositif n'a jamais rien attrapé, on ne sait pas s'il attrape quoi que ce soit. Un
  contrôle qu'on n'a pas vu échouer n'est pas un contrôle, c'est une intention.
