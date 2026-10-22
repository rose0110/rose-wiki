---
name: attente
description: >
  Rend à Rose, dans la session où elle se trouve, la liste à jour de tout ce qui l'attend
  dans ses sessions Claude Code : un lien cliquable par session qui attend vraiment une
  action d'elle (mot de passe, go de mise en ligne, mail à valider, choix métier, paiement,
  geste physique), les trois plus urgents d'abord. Archive au passage les sessions dont la
  tâche est terminée. À invoquer par /attente, ou quand Rose demande « qu'est-ce qui
  m'attend ? », « la liste des sessions en attente », « ce que je dois faire », « mes go ».
  La même liste arrive aussi seule deux fois par jour (tâche planifiée « ce-qui-attend-rose »).
---

# Ce qui attend Rose

Rose pilote une quinzaine de projets. Elle ne peut pas ouvrir des dizaines de sessions :
elle veut UN message, un lien par session, pour cliquer, agir, passer au suivant.
Décision de Rose du 20/10/2026 : « j'ai toutes les sessions qui attendent des informations,
c'est vraiment gagné beaucoup de temps ».

## Étapes

1. Charger les outils : ToolSearch
   `select:mcp__ccd_session_mgmt__list_sessions,mcp__ccd_session_mgmt__list_events,mcp__ccd_session_mgmt__archive_session`.
2. `list_sessions` avec `limit: 400`. Si le résultat part dans un fichier (trop long), le
   copier avec `cat` (Git Bash) dans `%TEMP%` puis le lire en Python : le chemin d'origine
   dépasse souvent la limite de longueur de Windows.
3. Garder les sessions non en cours (`isRunning: false`), actives depuis moins de 21 jours.
   Ignorer les titres qui contiennent « - jusqu au » (copies de synchronisation entre
   comptes) et la session courante.
4. Pour chacune, `list_events` (limit 6). Retenir seulement celles dont le dernier message
   de l'assistant attend VRAIMENT une action que seule Rose peut faire :
   - un mot de passe, une connexion à son compte, une validation sur son téléphone ;
   - un paiement, un plafond de dépense ;
   - un « go » de mise en ligne ;
   - la validation d'un texte à envoyer à un tiers (règle 13 : elle relit avant tout envoi) ;
   - un choix métier, de prix, juridique, qu'aucune source ne tranche ;
   - un geste physique (déposer un fichier sur un site, tester sur son téléphone).
   Une simple proposition de suite (« je peux aussi… ») n'est PAS une attente.
   Ne PAS lister non plus (retour de Rose du 20/10/2026 : « des choses que j'avais déjà relues ») :
   - une demande à laquelle Rose a déjà répondu (« ok », « vas-y », « envoie », remarque sur le texte),
     même si l'assistant a reposé la question ensuite : c'est la session qui doit agir, pas Rose ;
   - une demande dont la date est passée (visite, échéance, réunion déjà écoulée) ;
   - une demande lue dans un vieux résumé : seul compte le DERNIER message de l'assistant.
   Lire donc aussi les derniers messages de Rose (list_events limit 12) avant de retenir une ligne.
5. Session dont la tâche est clairement terminée (compte rendu final, tout est en ligne) et
   dont le dossier n'est pas un `.claude\worktrees\…` avec du travail non enregistré :
   l'archiver (`archive_session`, raison « Tâche terminée »). Un refus ne se réessaie pas.
   ⚠️ Une session dont le dernier message est une limite ou une erreur (« You've hit your limit »,
   « API Error », « 401 », « out of usage credits », « Prompt is too long ») a été COUPÉE en plein
   travail : elle n'est jamais terminée, même si rien d'autre n'apparaît. Incident du 20/10/2026 :
   l'application mobile du CRM Berceaux, coupée par la limite hebdomadaire, a été archivée par erreur.
   Jamais une session épinglée, en cours, ou dont la tâche n'est pas finie.
   ⚠️ Retour de Rose du 21/10/2026 (« il y a encore des tâches en attente dessus ») : le passage de
   8 h 30 a archivé « Solution OpenPay avec automatisations », « Suivi — facteur », « Construire
   l'assistant de réunions » et « Date de rupture Katia » parce que leur DERNIER message disait
   « rien n'attend ». Une session de projet enchaîne plusieurs tâches : la fin d'une tâche n'est pas
   la fin de la session. Règle : n'archiver QUE une session ouverte pour UNE seule tâche (celle de
   son premier message), dont cette tâche est livrée, et où Rose n'a pas ouvert d'autre sujet ensuite.
   Jamais une session de projet ou de suivi (titre de projet, plusieurs sujets dans le fil, travail
   récurrent, suivi d'un dossier ou d'une personne). Dans le doute, NE PAS archiver.
   Toute session remise dans la liste (`unarchive_session`) s'ajoute aussi à
   `~/.claude/outils/desarchivees.json` (champ `ids`) : sinon la synchronisation entre comptes, qui
   additionne les archives, la ré-archive au prochain changement de compte.
   Le passage automatique de 8 h 30 et 14 h 30 n'archive RIEN : seule la commande /attente,
   lancée par Rose, peut archiver.
6. Rendre la liste, sans aucune question :

```
Voici ce qui t'attend, un lien par session. Tu cliques, tu agis dans la session, puis tu passes au suivant. Les trois premiers sont les plus urgents.

**Clients et argent**
1. [Titre court](#local_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) : l'action attendue en quelques mots.

**Mises en ligne**
…
**Choix métier**
…
**Le reste**
…
```

   - Les 3 plus urgents d'abord (client en production, argent, échéance proche), puis les
     groupes dans cet ordre, un groupe vide ne s'affiche pas.
   - Le lien est exactement `[texte](#<sessionId>)` : c'est ce qui le rend cliquable dans l'app.
   - Dernière ligne seulement si des sessions ont été archivées : « J'ai aussi archivé N sessions terminées. »
   - Rien en attente : « Rien ne t'attend dans tes sessions pour l'instant. »

## Interdits

Ne rien mettre en ligne, n'envoyer aucun mail, ne modifier aucun fichier de projet, ne
réveiller aucune autre session. Lecture des sessions et archivage des tâches finies seulement.
Pas de jargon, pas de formule d'enthousiasme, pas d'emoji (style « Rose »).
