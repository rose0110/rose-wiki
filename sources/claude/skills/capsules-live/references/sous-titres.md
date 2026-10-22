# Règles de sous-titrage karaoké

Les sous-titres sont **écrits à la main**, cue par cue, à partir des fichiers
`words_<slug>.txt` (alignement Whisper mot à mot). Jamais de sous-titres générés
automatiquement sans relecture : Whisper écorche systématiquement le jargon.

## Format des cues
- 1 cue = 1 à 2 lignes, séparées par `|`. **Jamais 3 lignes.**
- **≤ 48 caractères par ligne** (au-delà, ça déborde du cadre 1080 px à la taille 46).
- Temps : début du premier mot de la cue, fin du dernier mot (lus dans
  `words_<slug>.txt`), convertis en RELATIF au clip final :
  `rel = abs − début_segment + durée_cumulée_des_segments_précédents`.
- Laisser les silences vides (pas de cue qui traîne pendant une pause).
- Découper aux **frontières de sens** (groupe nominal, proposition), pas au hasard.

## Accent couleur (`*mot*`)
- `*mot*` ou `*groupe de mots*` = rempli dans la couleur accent du preset.
- Accentuer : noms de produits (Claude, ChatGPT, Codex, Openpaye…), termes clés du
  message (DSN, URSSAF, RGPD, agent, 100 %), la punchline.
- 0 à 2 accents par cue — trop d'accents = plus d'accent du tout.

## Corrections obligatoires (Whisper entend mal)
Relire chaque cue contre le sens réel. Corrections récurrentes constatées :
- Cloud / Clou / Cloud Code → **Claude / Claude Code** ; Tchad GPT, JPT, 4GPT → **ChatGPT**
- Luxaf, URSAF → **URSSAF** ; CIG → **CSG** ; l'EG France → **Légifrance**
- paix / pay / Paypal → **paie** ; OpenPay → **Openpaye**
- poupée → **poubelle** ; stabilisaux → **stabilo** ; copulote → **Copilot**
- « résonne » → **raisonne** ; patriote atteint → **Patriot Act** ; Hoclouc → **Outlook**
- Lisser les hésitations et répétitions involontaires (« sur, c'est mon abonnement de »
  → « sur mon abonnement ») sans changer le sens ni le rythme des mots prononcés :
  le remplissage karaoké est proportionnel, un petit écart de mots est invisible,
  mais ne jamais réécrire une phrase entière.

## Exemple complet
Mots alignés (extrait de words_x.txt) :
```
 355.00  355.44 J'ai
 355.44  355.88 épuisé
 355.88  355.98 mes
 355.98  356.44 crédits.
```
Cue écrite (segment commençant à 343.95, aucun segment avant) :
```python
(11.05, 12.49, "J'ai épuisé mes *crédits*."),
```

## Vérification visuelle
Après fabrication, extraire 1 à 2 frames par capsule pendant une cue et vérifier :
remplissage karaoké visible (mots passés en couleur pleine, mots à venir estompés),
accents dans la couleur du preset, aucune ligne qui déborde du cadre.
