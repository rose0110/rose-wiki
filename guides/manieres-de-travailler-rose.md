# Manières de travailler de Rose — à lire par toute IA avant d'agir en son nom

*Créé le 19/10/2026. Destinataire : un agent IA (ou un collaborateur) qui répond au support ou développe pour Rose pendant son absence. À lire **avant** toute réponse ou tout code. Complète [continuite.md](../continuite.md). Aucune donnée personnelle de salarié ni aucun secret ici.*

**Méthode.** Messages de Rose dans ses sessions Claude Code des 60 derniers jours (4 981 fichiers, ~12 800 messages uniques après dédoublonnage), recherche par mots-clés + lecture d'échantillons ; titres des 352 sessions Codex (`session_index`). Les nombres ci-dessous sont des **occurrences de mots-clés, indicatives** (un message peut compter dans plusieurs thèmes ; certains mots comme « valider » ou « mail » ont aussi des emplois neutres). Les messages Codex détaillés (rollouts) n'ont pas été extraits : **À compléter**. Les citations sont courtes, corrigées des fautes de frappe et anonymisées.

## 1. Remarques récurrentes de Rose à l'IA → règles

| # | Thème | Fréquence (indicative) | Exemples (anonymisés) | Règle à appliquer |
|---|---|---|---|---|
| 1 | **Mise en ligne / validation** | ~2 300 messages évoquent go, déploiement, validation | « déploie le train » · « Pourquoi tu ne fais pas toutes les corrections avant la mise en ligne ? » · « tu as envoyé le mail sans ma validation ? » | Ses projets : pas de prod sans go (un go par lot). Toutes les corrections avant **une seule** mise en ligne. Jamais d'email sans validation expresse. |
| 2 | **Fais-le toi-même / autonomie** | ~270 « toi-même », « sans me demander » ; ~510 « continue », « jusqu'au bout » | « vérifie toi-même » · « fais-le toi-même, vas-y » · « utilise tes tokens, ne me demande pas une clé API » · « va jusqu'au bout, je te fais confiance » | Ne demande à Rose que ce que tu ne peux techniquement pas faire. Pas de « je continue ? ». Tranche les choix techniques et documente-les. |
| 3 | **Langage simple, court, pas technique** | ~160 « plus court / résumé », ~60 « trop technique » | « version courte, c'est trop technique et trop long » · « pas trop technique, dis seulement que ça marche » · « en langage plus simple » | Réponses en français, courtes, sans jargon. D'abord le résultat (marche / ne marche pas), puis seulement si utile le détail. |
| 4 | **Trop d'information / écran trop chargé** | ~70 explicites (+ ~290 sur la mise en page) | « TOUJOURS TROP CHARGÉ !!! » · « tu m'as noyée dans des informations, allons-y pas à pas » · « trop de texte en bas et du vide en haut » | Un écran = une tâche ; un message = une idée principale. Aérer (puces), répartir les espaces, épurer. Voir § 4. |
| 5 | **Vérifier pour de vrai / preuves** | ~1 000 mentions de vérification ; ~75 « tu es sûr ? / tu as testé ? » | « tu as testé le calcul DSN ? » · « tu es sûr qu'il ne manque rien ? » · « ce chantier est vraiment terminé ? » | Ne jamais dire « vérifié » sans l'avoir fait. Livrer la preuve (capture, log, URL testée sans session). Dire ce qui n'a pas été regardé. |
| 6 | **Reprendre les chantiers inachevés** | ~900 mentions de chantier / reprise | « on le finit COMPLÈTEMENT avant de passer à autre chose » · « pourquoi on s'arrête à 95 % ? » · « reprends où ça s'est arrêté » | Lire `CHANTIERS.md` en premier, finir avant d'ouvrir autre chose, mettre les nouvelles idées en file d'attente. |
| 7 | **Questions une à une / formulaire** | ~15 « une à une », règle écrite (n°30) | « pose-moi les questions une à une » · « quand tu me poses des questions dans un texte, je ne me retrouve pas » | Questions regroupées dans un formulaire avec options (recommandée en premier), ou une par une. Jamais en fin de compte rendu. |
| 8 | **Sources officielles, pas d'invention** | ~480 « source » ; ~70 « inventé » | « France Travail est vraiment un organisme collecteur ? tu as inventé ? » · « quelle est ta source ? » · « la jurisprudence, c'est aussi une source » · « tu n'as pas utilisé le vrai logo, tu l'as réinventé » | Toute affirmation métier est sourcée (Légifrance, BOSS, URSSAF, KALI, ELENET). Utiliser les vrais éléments (logo, photo, textes) fournis par Rose. Ne pas inventer de besoin. |
| 9 | **Régressions / « ça ne marche plus »** | ~280 bugs / régressions | « le port 4000 ne fonctionne plus, ça devait rester définitif » · « tu as fait les tests de bout en bout ? » | Tests de non-régression avant et après ; un bug corrigé reçoit un test qui le rejoue. |
| 10 | **Ton des écrits** | règle écrite (n°13) + remarques | « je n'aime pas ce type de formule, bonne question, bonne nouvelle… un ton un peu surjoué » · « je n'aime pas cette formulation, dis : je vous propose » · « tutoie-la et envoie, message plus court » | Factuel, amical, court. Pas de « bonne nouvelle », pas de superlatifs, phrases positives (pas de négations-slogans). Tutoiement/vouvoiement selon la personne : demander si inconnu. |

**Top 5 à retenir** : (1) ne rien mettre en ligne ni envoyer sans son accord ; (2) faire soi-même au lieu de lui demander ; (3) court, simple, en français ; (4) épuré, une chose à la fois ; (5) prouver ce qu'on affirme.

## 2. Comment Rose répond au support

Ce qui est visible dans ses sessions (cas clients, mails à des cabinets, salariés, familles) :
- **D'abord vérifier les faits** avant de répondre : relire la base en **lecture seule**, le coffre de bulletins, l'historique du dossier ; ne pas transformer un signalement en autre demande (relire l'intention exacte du message reçu).
- **Transmettre au bon interlocuteur** : quand le message vient d'un salarié d'un client, Rose écrit souvent au responsable chez le client (cabinet / employeur) avec les **constats établis**, et lui demande ce qu'il souhaite répondre — pas de réponse directe au salarié sans son accord.
- **Structure d'un mail client** : ce qui a été fait → ce qui n'a pas marché → ce qu'on fait maintenant. Pas d'explication du mécanisme technique.
- **Ton** : factuel, amical, bienveillant, court ; remercier quand il y a lieu (« remercie-le pour le mail ») ; une demande d'action claire (« plus vite c'est signé, plus vite… »).
- **Brouillon montré avant tout envoi** (destinataires, objet, texte, pièces jointes), envoi seulement sur accord explicite (« OK ENVOIE »). Envoi depuis son adresse pro, Reply-To identique.
- **Une relance, pas de harcèlement** : en prospection, un message une seule fois, jamais de relance automatique sans décision de Rose.
- Pour un doute réglementaire : trancher par les sources, ne pas écrire à l'organisme.
- **À compléter avec l'analyse des mails** : formules d'ouverture/fermeture habituelles, délais de réponse, signature, cas types (DSN rejetée, bulletin manquant, accès perdu), escalade.

## 3. Comment Rose rédige une fonctionnalité / un chantier

Motifs observés dans les `PROMPT-CHANTIER-*.md` et les `CHANTIERS.md` :
- **Un fichier `PROMPT-CHANTIER-<NOM>.md`** dans le dépôt, avec une ligne « Comment le lancer » (ouvrir une session dans tel dossier, coller : « Lis ce fichier et exécute tout ce qui est sous la ligne de séparation… y compris la règle "ne me demande rien" »).
- Sections : **MISSION** (point de départ prouvé, objectif daté, critères de réussite numérotés), **GARDE-FOUS** (données synthétiques, non-régression d'abord, ne pas casser le run précédent, Node/lockfile, revue du diff), **ORCHESTRATION** (agents spécialisés : juriste, calcul au centime, sécurité/IDOR, QA navigateur, rédacteur), **PREUVES ET VERDICT** (fichier d'état `.codex/chantier-state.json`, reçu `VERDICT-FINAL.json`), **AUTONOMIE** (« je ne répondrai à aucune question en cours de route : tranche toi-même et écris pourquoi »).
- Contexte métier explicite (contrat, dates de recette, enjeu financier) pour justifier l'exigence.
- **`CHANTIERS.md` = file d'attente** : tableau *Chantier | État réel | Prochaine action | Qui*, ouverts par priorité, « Idées en attente », « Actions réservées à Rose », « Terminés (avec preuve) ». Un chantier ne sort qu'en production prouvée ou abandonné par Rose.
- **`PROJECT-HANDOFF.md`** : entrées datées (les plus récentes en haut), SHA exacts, identifiants de déploiement, ce qui est en ligne / pas en ligne, rollback, « Non vérifié ».
- Avant une nouvelle forme d'écran : **interrogatoire** (questions par tours au formulaire), décisions de Rose consignées « tour par tour », choix techniques tranchés par l'IA et notés comme tels.

## 4. Règles UX (résumé de STANDARD-ROSE-UX.md)

- Pas de charte unique : chaque projet a son identité (couleurs dans son propre CLAUDE.md) ; le standard dit *comment* construire.
- Rien entre le haut de la page et le contenu utile (pas de bandeaux d'indicateurs ni de cartes qui repoussent la liste).
- Répartition des espaces équilibrée : ni vide d'un côté, ni tassement de l'autre.
- Densité : lignes fines, tableaux aérés plutôt que cartes ; deux lignes max par élément ; ne pas afficher les codes techniques.
- Un nouvel écran reprend ses voisins (en-tête, police, tailles, menu).
- Pas de rendu générique « fait par IA » ; regarder ce que font les autres avant de concevoir.
- Une notion ajoutée apparaît partout où elle a un sens (base, moteur, interface, documents, assistant).
- Une décision à la fois ; une action = un écran plein (pas de panneau superposé).
- Signaler ce qu'on voit, même hors consigne ; prouver, et avouer ce qui n'a pas été regardé.
- Menu rangé par fréquence d'usage ; dates affichées calculées, jamais écrites en dur.
- Explications repliées derrière une bulle ⓘ ; champs rarement utiles repliés derrière un bouton ; un assistant ne s'ouvre pas sur son mode d'emploi.
- Format selon qui ouvre l'écran (gestionnaire de paie = ordinateur ; parents/salariés = téléphone).
- Libellé et valeur sur la même ligne ; sous-titres distincts du texte ; puces plutôt que paquets de texte ; pas de double défilement.
- Placeholders contextuels et légers (jamais « Jean Dupont »).
- Les PDF (certificats, reçus) obéissent aux mêmes règles que les écrans.
- Écrit : phrases positives, pas d'effet d'annonce.

*Dernière mise à jour : 19/10/2026.*
