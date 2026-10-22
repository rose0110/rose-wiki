# Le logo du client et sa charte — avec, ou sans

Le contrat est produit **à la charte du client** : son logo en haut de la première page, ses
couleurs dans les bandeaux et les filets. C'est ce qui fait qu'il a l'air d'avoir toujours
appartenu au client, et c'est la première chose qu'il voit. Chercher le logo est donc
systématique — mais **son absence ne bloque jamais** : le gabarit a un mode sans logo.

---

## 1. Chercher le logo, dans cet ordre

1. **Ce que le client a déjà transmis** : pièces jointes de ses mails, papier à en-tête, devis,
   plaquette, ancien contrat. Une signature de mail contient souvent le logo en PNG.
2. **Son site web** (adresse dans sa signature ou via l'API recherche-entreprises → rechercher
   le nom). Essayer, avec `curl` ou l'outil de récupération web disponible :
   ```bash
   curl -s -L -o logo.svg "https://<site>/logo.svg"
   curl -s -L -o logo.png "https://<site>/logo.png"
   ```
   puis, si rien : le code de la page d'accueil (`curl -s -L https://<site>/ | grep -oiE 'src="[^"]*logo[^"]*"'`),
   l'image « og:image », l'icône (`/favicon.ico`, `/apple-touch-icon.png`) en dernier recours —
   une icône trop petite ou trop carrée donne un mauvais rendu : la refuser.
3. **Rien de trouvé** → mode sans logo (section 3) **et** on le demande au client (section 4).

Refuser un logo pixelisé, flou, avec un fond blanc opaque sur un document qui a un fond coloré,
ou dont on n'est pas sûr qu'il est bien celui de ce client (homonymes).

## 2. Préparer le logo et extraire la charte

- **SVG → PNG haute définition, fond transparent** :
  ```bash
  python -c "import fitz; d=fitz.open('logo.svg'); d[0].get_pixmap(matrix=fitz.Matrix(8,8), alpha=True).save('logo.png')"
  ```
  Sans PyMuPDF : `rsvg-convert -w 1200 logo.svg -o logo.png` ou `inkscape logo.svg -w 1200 -o logo.png`
  ou LibreOffice `soffice --headless --convert-to png logo.svg`.
- **La charte se lit dans le logo** :
  ```bash
  grep -oiE "#[0-9a-f]{6}" logo.svg | sort | uniq -c | sort -rn | head
  ```
  Pour un PNG : `python -c "from PIL import Image; im=Image.open('logo.png').convert('RGBA'); print(sorted(im.getcolors(10**6), reverse=True)[:8])"`.
  Choisir **une couleur foncée** (bandeaux d'articles, titres, tableau des parties) et **une
  couleur vive** (filets d'accent). Si le logo est monochrome, garder la couleur foncée du logo
  et un accent gris chaud. Le texte des bandeaux étant blanc, la couleur foncée doit rester
  lisible : pas de jaune, pas de pastel.
- Dans `gabarit-contrat.cjs`, renseigner `logo: 'logo.png'`, `couleurFoncee`, `couleurAccent`.
  Le logo est rendu dans un cadre de 96 × 87 pt : si le logo est très large (bannière), ajuster
  `logoLargeur`/`logoHauteur` en respectant ses proportions (les lire : `python -c "from PIL import Image; print(Image.open('logo.png').size)"`).

## 3. Mode sans logo

Dans `gabarit-contrat.cjs` : `logo: ''`. Le gabarit remplace alors l'image par **le nom du client
en capitales**, dans la couleur foncée, à la place du logo — même mise en page, même structure.
Les couleurs par défaut du gabarit (bleu nuit `1F2A44` et or `B58E3C`) sont sobres et
conviennent à n'importe quel client ; ne pas inventer une charte que le client n'a pas.

Le document reste complet et signable. Ce n'est pas une version dégradée : c'est la version
tant que le client n'a pas fourni son logo.

## 4. Demander le logo au client — à chaque livraison sans logo

Quand on livre un contrat sans logo, le message au client contient **une phrase** pour le
demander, factuelle, sans insister — le client décide :

> Le contrat est mis en page sans votre logo, que je n'ai pas trouvé. Si vous m'envoyez votre
> logo (fichier PNG ou SVG, fond transparent de préférence), les prochains contrats et celui-ci
> le porteront, avec vos couleurs.

Une fois reçu : l'enregistrer dans le dossier du client (`logo.png` + les deux couleurs
retenues) pour ne plus jamais avoir à le chercher, et régénérer le contrat en cours si le
client le souhaite.

Ce qu'on n'écrit pas : « bonne nouvelle », « ce serait super », « n'hésitez pas » — le fait,
et rien d'autre.
