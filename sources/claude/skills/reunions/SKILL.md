---
name: reunions
description: >
  Interroger la base des réunions de Rose (transcriptions, comptes rendus, engagements, brouillons de mail de
  suivi) tenue par son assistant de réunions sur atelier-paie. À charger dès que Rose demande ce qui s'est dit
  dans une réunion, ce qu'elle a promis à quelqu'un (« qu'ai-je promis à X ? », « qu'est-ce qu'on avait convenu
  avec Y ? »), ce qu'un client s'est engagé à envoyer, le compte rendu ou le mail de suivi d'une réunion, ou l'état
  du robot de prise de notes (« le robot est-il bien allé à ma réunion ? »). Vaut pour tous les projets.
---

# Base des réunions de Rose

L'assistant de réunions (dossier `C:\Users\roses\Downloads\Python\assistant-reunions`, passation
`PROJECT-HANDOFF.md`) enregistre les réunions en ligne (robot « Prise de notes – Rose YEMELI ») et sur place
(raccourci « Enregistrer une réunion » du Bureau), les transcrit, les résume et range tout dans une base SQLite
sur `atelier-paie`. Rose ne consulte pas cette base elle-même : c'est toi qui l'interroges pour elle.

## Comment interroger

**En priorité : le connecteur MCP « pnr »** (PNR = Prise de Notes Rose, installé le 22/10/2026 dans Claude Code au
niveau utilisateur, Claude Desktop et Codex). Outils : `chercher`, `engagements` (personne, depuis, tous), `lire`
(transcription en option), `liste`, `etat`, et `relancer` (seulement une réunion en échec). Il passe lui-même par SSH ;
rien n'est exposé sur Internet.

Si le connecteur n'est pas chargé dans la session, même chose par SSH :

Toujours par SSH, en lecture ; la commande s'exécute sur le serveur, rien ne sort ailleurs :

```
ssh atelier-paie "cd ~/assistant-reunions/app && python3 -B reunions.py <commande>"
```

| Besoin | Commande |
|---|---|
| Ce que Rose a promis à une personne / une entreprise | `engagements --personne "Nom"` (ajouter `--tous` pour les promesses des autres) |
| Retrouver un sujet, un mot, un chiffre | `chercher "mots clés"` (accents ignorés, plusieurs mots = OU) |
| Lire une réunion | `lire <id>` ; avec la transcription intégrale : `lire <id> --transcription` |
| Dernières réunions | `liste --nombre 20` ou `liste --depuis 2026-10-01` |
| Le robot fonctionne-t-il ? | `etat` (robots programmés, incidents, disque) |
| Retraiter une réunion en échec | `relancer <id>` |

## Méthode de réponse

1. Commencer par `engagements --personne` ou `chercher`, puis **lire la réunion concernée** (`lire <id>`, et la
   transcription si la question est précise) avant de répondre : le compte rendu est produit par un modèle local,
   la transcription fait foi.
2. Répondre à Rose en quelques lignes : la réponse, la réunion et sa date. Distinguer ce qui est dit mot pour mot
   dans la transcription de ce qui vient du compte rendu (règle 16 : mesuré / déduit).
3. Si rien n'est trouvé, le dire, et préciser les mots cherchés. Ne jamais conclure « il n'a rien été promis » sur
   une seule recherche : essayer le nom de la personne, de l'entreprise, et le sujet.
4. Les transcriptions contiennent des erreurs de mots (noms propres surtout) : chercher aussi des variantes.
5. Sur place, les orateurs sont « Voix 1 », « Voix 2 »… (voix séparées automatiquement). `lire` affiche, sous
   « Voix », le nom rapproché de chaque voix et la phrase qui le prouve, ou « non identifiée ». Ce rapprochement
   est déduit par le modèle local : le dire comme tel, et ne jamais nommer une voix « non identifiée ».

## À ne pas faire

- Ne jamais envoyer de mail : les brouillons sont dans Outlook, Rose les relit et les envoie (règle 13).
- Ne jamais recopier une transcription entière dans la conversation sans besoin : citer le passage utile.
- Le son et la vidéo sont effacés après 30 jours ; le texte reste.
