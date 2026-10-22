---
name: mail-perso
description: >
  Envoyer un email personnel/professionnel au nom de Rose YEMELI, avec sa
  signature complète (Rose YEMELI · Présidente · Experte paie, IA & automatisation
  · coordonnées · logos Smart Data Pay / Innov'Paie / DataPaie). À utiliser dès que
  Rose veut « envoyer un mail », « répondre à ce mail », « écrire un email »,
  « envoyer ça par mail », rédiger une réponse à un contact/client, etc. Expédie via
  Resend depuis rose.yemeli@yso-conseils.com (ou un autre domaine vérifié de Rose).
---

# Envoi de mail perso (Rose YEMELI)

Skill pour rédiger et envoyer un email signé Rose YEMELI, signature + 3 logos inclus
automatiquement. Moteur : `send_mail.py` (dans ce dossier). Logos embarqués en base64
(dossier `logos/`) → la signature s'affiche sans hébergement externe, fiable partout.

## Rendu : un mail normal (décision Rose du 07/10/2026)

Rose : « je n'aime pas trop le format […] un mail normal sans mise en page particulière ».
Le mail ne doit PAS ressembler à une newsletter : pas de fond gris, pas de carte blanche
centrée, pas de largeur fixe, pas de couleurs dans le corps ni dans la signature, pas de
listes à puces ni de gras décoratif dans le corps. Seulement des paragraphes `<p>` simples,
puis la signature sobre (nom en gras, titre, téléphone + site cliquable, petite rangée de logos).
**Pas d'adresse email dans la signature** (Rose, 07/10/2026 : « s'il reçoit mon mail, c'est
qu'il a mon adresse »). Le site roseyemeli.com est un lien cliquable.

## Copie cachée systématique à Rose (décision du 07/10/2026)

Chaque envoi part avec `rose.yemeli@yso-conseils.com` en **copie cachée**, automatiquement
(Resend ne garde pas de dossier « Envoyés » : la copie est l'archive de Rose). Le script
l'ajoute seul ; ne la retirer qu'avec `--no-self-bcc` et sur demande explicite de Rose.
Avant tout envoi, relire l'aperçu `--dry-run` en se demandant : « est-ce que ça ressemble
à un mail écrit à la main ? ».

## Workflow (à suivre à chaque envoi)

1. **Rédiger le corps** en fragment HTML (juste les paragraphes, PAS la signature —
   elle est ajoutée automatiquement). Écrire ce corps dans un fichier `.html`, p. ex.
   `corps.html`. Exemple : `<p>Bonjour Kamal,</p><p>…</p><p>Merci.</p>`.
   Ton sobre et factuel (cf. règles de Rose), pas de slogans, pas de « bonne nouvelle ».

2. **Confirmer les destinataires** avant tout envoi (action irréversible). Si l'adresse
   d'un destinataire vient d'une capture/copie et pourrait être masquée ou approximative,
   la faire confirmer par Rose. Par défaut, « répondre à tous » = reprendre To + Cc du mail
   d'origine.

3. **Nommer les pièces jointes avec l'information distinctive EN PREMIER.** Les boîtes mail
   tronquent la fin des noms longs : « Bulletin de paie - NOM PRENOM - Septembre 2026.pdf »
   s'affiche « Bulletin de paie - NOM PRE… » et le mois disparaît. Quand plusieurs pièces se
   ressemblent, ce qui les distingue (mois, période, numéro) se met juste après le type de
   document : « Bulletin septembre 2026 - NOM.pdf ». Vérifiable : masquer les 25 derniers
   caractères de chaque nom et vérifier qu'on distingue encore les pièces entre elles.
   *(Demandé par Rose le 07/10/2026, après un envoi de 3 bulletins indiscernables.)*

4. **Relire en `--dry-run`** (génère `_last_preview.html` sans envoyer), puis **MONTRER à Rose
   le destinataire, l'objet et le texte intégral, et attendre son « ok » sur ce texte. TOUJOURS,
   même si elle a dit « envoie »** (obligation posée par Rose le 12/10/2026 et confirmée le
   18/10/2026 après le mail planning à Annette). Montrer aussi les copies et les pièces jointes.
   Même un texte dicté doit être présenté : l'accord doit être postérieur à la présentation
   de la version complète. Une relecture interne ou un aperçu masqué ne suffit pas. Après
   accord, envoyer cette version sans redemander ; une modification matérielle exige une
   nouvelle présentation et validation. Pour un client : aucun secret de fabrication (ce qu'on automatise,
   comment on récupère les informations) — cf. RÈGLE 13 du CLAUDE.md global.

5. **Envoyer** une fois validé, puis **donner l'id Resend** retourné (preuve d'envoi).

## Commandes

Relecture (n'envoie pas) :
```
python "C:\Users\roses\.claude\skills\mail-perso\send_mail.py" \
  --to "destinataire@x.fr" --cc "copie@x.fr" \
  --subject "Objet" --body-file corps.html --dry-run
```

Envoi réel :
```
python "C:\Users\roses\.claude\skills\mail-perso\send_mail.py" \
  --to "destinataire@x.fr" --cc "copie@x.fr" \
  --subject "Objet" --body-file corps.html
```

Options : `--to` (virgules pour plusieurs), `--cc`, `--bcc`, `--subject`, `--body-file`
(ou `--body` inline), `--text` (sinon dérivé du HTML), `--sender`
(défaut `rose.yemeli@yso-conseils.com`), `--from-name` (défaut « Rose YEMELI »),
`--reply-to` (défaut = expéditeur), `--attach` (pièces jointes, chemins séparés par des
virgules — PDF, PNG, etc. ; encodées en base64 et envoyées via le champ `attachments` de Resend).

## Détails techniques (déjà gérés, pour mémoire)

- **Expéditeur par défaut** : `rose.yemeli@yso-conseils.com`, Reply-To identique (RÈGLE N°0).
  Pour envoyer d'un autre domaine de Rose, passer `--sender` (ex. `rose@roseyemeli.com`).
  Impossible d'expédier depuis `@gmail.com` via Resend (domaine non vérifié).
- **Clé Resend** : choisie automatiquement selon le domaine de l'expéditeur, lue dans
  `C:\Users\roses\Downloads\Python\resend.txt` (override : variable `RESEND_KEYS_FILE`).
  Ne jamais afficher la clé en clair.
- **Piège Cloudflare** : Resend est derrière Cloudflare qui bloque le User-Agent par défaut
  de Python `urllib` (→ HTTP 403 / `error code: 1010`). Le script force déjà un User-Agent
  navigateur. Cf. mémoire `reference_resend_envoi_pc_windows`.
- **Signature** : identité fixe de Rose (Rose YEMELI). Pour la modifier (téléphone, logos,
  ordre…), éditer `signature_html()` dans `send_mail.py` et les images dans `logos/`.

## Pour mettre à jour les logos

Les logos prêts viennent de `C:\Users\roses\Downloads\Python\signature-email\`
(scripts `prep_logos.py` = rognage/normalisation, `build_signature.py` = signature HTML,
`preview_signature.py` = aperçu PNG). Recopier les `*_sig.png` dans `logos/` après mise à jour.
