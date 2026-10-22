# Installer la compétence et ses outils

## 1. Où mettre le dossier

**Claude Code (ordinateur)** — copier le dossier `contrat-travail` (avec `SKILL.md`,
`gabarit-contrat.cjs` et `references/`) dans :

- Windows : `C:\Users\<vous>\.claude\skills\contrat-travail\`
- Mac / Linux : `~/.claude/skills/contrat-travail/`

Redémarrer Claude Code : la compétence apparaît et se déclenche dès qu'on demande un contrat
de travail, un avenant, une promesse d'embauche.

**Claude.ai (navigateur)** — compresser le dossier en `contrat-travail.zip` (le fichier
`SKILL.md` doit être à la racine du dossier zippé) et l'ajouter dans Paramètres → Capacités →
Compétences. Les scripts tournent dans l'environnement de Claude.ai, qui contient Node.js,
LibreOffice et Python ; la récupération d'un site (logo, API entreprises) passe alors par
l'outil de recherche/récupération web de Claude, pas par `curl`.

## 2. Les outils dont le gabarit a besoin (Claude Code)

| Outil | Pour quoi | Vérifier | Installer |
|---|---|---|---|
| **Node.js** (≥ 18) | Exécuter le gabarit | `node -v` | nodejs.org (LTS) |
| **Paquet `docx`** | Construire le Word | `node -e "require('docx')"` dans le dossier de travail | `npm install docx` dans le dossier de travail (ou une fois pour toutes : `npm install -g docx` puis `set NODE_PATH=%AppData%\npm\node_modules` / `export NODE_PATH=$(npm root -g)`) |
| **LibreOffice** | Convertir en PDF | `soffice --version` | libreoffice.org ; Windows : `C:\Program Files\LibreOffice\program\soffice.exe` |
| **Python 3 + PyMuPDF** | Convertir un logo SVG, rendre les pages en images pour les relire | `python -c "import fitz"` | `pip install pymupdf` |
| **Pillow** (facultatif) | Lire les couleurs et la taille d'un logo PNG | `python -c "import PIL"` | `pip install pillow` |

Claude vérifie ces outils lui-même à la première utilisation et installe ce qui manque
(`npm install docx`, `pip install pymupdf`) — il ne demande à l'utilisateur que ce qu'il ne
peut pas faire seul (installer LibreOffice ou Node.js si absents).

## 3. Commandes de référence

```bash
# 1. générer le Word (depuis le dossier de travail où sont gabarit-contrat.cjs et logo.png)
node gabarit-contrat.cjs

# 2. convertir en PDF
soffice --headless --convert-to pdf "Contrat CDI - CLIENT - NOM.docx" --outdir .
#   Windows, si soffice n'est pas dans le PATH :
#   "/c/Program Files/LibreOffice/program/soffice.exe" --headless --convert-to pdf "<fichier>.docx" --outdir .

# 3. rendre chaque page en image pour la relire
python -c "import fitz; d=fitz.open('<fichier>.pdf'); print(len(d),'pages'); [d[i].get_pixmap(dpi=100).save('p%d.png'%(i+1)) for i in range(len(d))]"
#   sans PyMuPDF : pdftoppm -r 100 -png "<fichier>.pdf" p
```

## 4. Ce qui n'est PAS dans cette compétence

- Aucune donnée client, aucun logo, aucun contrat : elle ne contient que la méthode et le gabarit.
- Aucune signature ni cachet : c'est toujours le client qui signe.
- Les montants qui changent chaque année (SMIC, seuils, taxe employeur) ne sont pas codés :
  la compétence dit **où** les vérifier, à chaque contrat.
