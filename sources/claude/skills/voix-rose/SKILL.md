---
name: voix-rose
description: Produire une voix off avec la VOIX CLONÉE de Rose (ElevenLabs « Rose YEMELI ») — vidéos de formation, capsules, montages, tutoriels — avec ses règles de prononciation, son style pédagogique et les contrôles obligatoires. À charger dès qu'un texte doit être dit « avec ma voix », « ma voix clonée », « la voix de Rose », ou qu'un montage vidéo de Rose a besoin d'une voix off, dans TOUS les projets.
---

# Voix clonée de Rose — mode d'emploi

## La voix

- Outil : ElevenLabs (MCP `ElevenLabs`, abonnement Creator de Rose). Voix **« Rose YEMELI »**, version
  **professionnelle** : `voice_id = hBiaE36mu0KQAf3OVMiz` (à préférer). Il existe aussi un clone instantané plus
  ancien (`hANLHdJdWjWVb6rekp1C`) : ne pas l'utiliser sans raison.
- Modèle `eleven_multilingual_v2`, langue `fr`, réglages par défaut (stabilité 0,5, similarité 0,75).
- Le serveur MCP n'écrit et ne lit que sous `C:\Users\roses\Desktop` : y créer un dossier temporaire, déplacer les
  fichiers produits vers le dossier de travail, puis **supprimer le dossier temporaire** du Bureau.
- Chaque appel coûte des caractères : vérifier `check_subscription` avant une série longue.

## Règles de prononciation (texte envoyé à la voix SEULEMENT — l'écran garde l'orthographe juste)

| Écrire pour la voix | Au lieu de | Pourquoi |
|---|---|---|
| **paye** (« dossier de paye », « bulletin de paye », « calculs de paye », « gestionnaire de paye ») | paie | « paie » est prononcé « paix » (demande de Rose du 13/10/2026) |

Ajouter ici toute nouvelle correction que Rose signale, avec la date. Ne jamais modifier le texte affiché à l'écran,
les sous-titres ni les fiches : la règle ne vaut que pour la chaîne envoyée à la synthèse.

## Le style (ce qui fait ses vidéos)

Rose est **pédagogique au-delà du logiciel** : elle ne dit jamais seulement « cliquez ici ». Chaque étape dit quoi
faire ET pourquoi ; une ou deux parenthèses courtes sur le droit du travail ou la convention collective, « sans en faire
trop » ; une mise en garde tirée du terrain (« ne mettez pas… ») ; un mini récapitulatif (« donc… ») ; « vous » ;
elle borne le sujet (« je ne rentre pas dans les détails »). Ne JAMAIS lui inventer une anecdote ou une expérience.
Détail : mémoire `feedback_style_pedagogique_videos_rose` (projet SmartDataPay).

## Circuit obligatoire

1. **Texte d'abord** : écrit depuis la source (fiche, leçon), chaque parenthèse de droit sourcée et relue par
   `juriste-paie` (absolus vérifiés).
2. **Rose valide le texte** AVANT toute synthèse (même quand elle a dit « fais la vidéo »).
3. **Synthèse** segment par segment (un écran = un segment), en appliquant les règles de prononciation ci-dessus.
4. **Contrôles avant de lui envoyer** :
   - durée et volume moyen de chaque segment (`ffprobe`, `ffmpeg -af volumedetect`) : aucun segment muet ;
   - **retranscription** du fichier assemblé (`speech_to_text`, langue `fra`) comparée au texte validé ;
   - écoute du premier rendu par Rose (ton, rythme) avant tout montage.
5. Publication publique (YouTube, réseaux) : validation de Rose sur chaque vidéo, sans exception.
