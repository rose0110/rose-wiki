/**
 * GABARIT — contrat de travail au standard du cabinet.
 *
 * Copier ce fichier dans le dossier de travail, renseigner CONFIG et ARTICLES,
 * placer logo.png à côté (ou laisser logo: '' s'il n'y en a pas), puis :
 *   npm install docx            (une fois par dossier de travail, si le paquet n'est pas déjà accessible)
 *   node gabarit-contrat.cjs
 *   soffice --headless --convert-to pdf "<sortie>.docx" --outdir .
 *
 * Puis TOUJOURS regarder le rendu :
 *   python -c "import fitz; d=fitz.open('<sortie>.pdf'); print(len(d),'pages'); [d[i].get_pixmap(dpi=100).save('p%d.png'%(i+1)) for i in range(len(d))]"
 *
 * Voir SKILL.md et references/ (ccn.md, controles.md, salarie-etranger.md, logo-et-charte.md).
 */
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat, convertMillimetersToTwip,
  Header, Footer, PageNumber, NumberFormat, Table, TableRow, TableCell, WidthType, BorderStyle,
  ImageRun, ShadingType, VerticalAlign, TableLayoutType,
} = require('docx');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG — la seule partie à modifier d'un contrat à l'autre
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  sortie: 'Contrat CDI - CLIENT - NOM SALARIE.docx',

  // Le salarié : 'F' → la Salariée / 'M' → le Salarié (accords sur tout le document)
  genre: 'F',

  // Logo du client, PNG fond transparent, converti depuis son SVG (references/logo-et-charte.md).
  // Laisser '' si le client n'a pas de logo : son nom prend la place, même mise en page.
  logo: 'logo.png',
  logoLargeur: 96, logoHauteur: 87,       // en points ; respecter les proportions du logo

  // Charte extraite du logo : grep -oiE "#[0-9a-f]{6}" logo.svg | sort | uniq -c | sort -rn
  // Sans logo : garder les valeurs par défaut ci-dessous (bleu nuit / or), ne pas inventer une charte.
  couleurFoncee: '1F2A44',                // bandeaux d'articles, titres, tableaux des parties
  couleurAccent: 'B58E3C',                // filets
  couleurPapier: 'F5F3EE',                // fond des libellés de tableau
  couleurGrise: '6B6862',

  titre: 'CONTRAT DE TRAVAIL',
  sousTitre: 'à durée indéterminée — temps partiel',
  priseEffet: 'Prise d’effet : JJ mois AAAA',
  objetCourant: 'Contrat de travail à durée indéterminée à temps partiel — PRÉNOM NOM',
  nomClient: 'RAISON SOCIALE',

  // Pied de page légal (une ligne, puis adresse + pagination)
  mentionsLegales: 'RAISON SOCIALE — SASU au capital de X € · RCS Ville 000 000 000 · SIRET 000 000 000 00000 · APE 0000A',
  adresse: 'adresse de l’établissement',

  lieuDate: 'Fait à VILLE, le JJ mois AAAA, en deux exemplaires originaux dont un remis {au salarié}.',
  signataireEmployeur: 'PRÉNOM NOM, Président',
  signataireSalarie: 'PRÉNOM NOM',
  mentionSalarie: '(signature précédée de la mention manuscrite « lu et approuvé »)',
  annexe: '', // ex. 'Annexe : demande écrite {du salarié} (article L. 3123-7 du Code du travail).'

  employeur: [
    ['Dénomination', 'RAISON SOCIALE'],
    ['Forme juridique', 'Société par actions simplifiée (SAS) au capital de X €'],
    ['Immatriculation', 'RCS Ville 000 000 000 — SIRET 000 000 000 00000 — code APE 0000A'],
    ['Siège social', 'adresse'],
    ['Établissement', 'adresse'],
    ['Représentée par', 'Prénom NOM, Président'],
  ],
  salarie: [
    ['Nom et prénom', 'Madame Prénom NOM'],
    ['{Née} le', 'JJ mois AAAA à Ville (00)'],
    ['Nationalité', 'Française'],
    ['Domicile', 'adresse'],
    ['N° de sécurité sociale', '0 00 00 00 000 000 00'],
    ['Adresse électronique', 'courriel'],
  ],
};

// ── Accords de genre, utilisables dans CONFIG et dans les ARTICLES :
//    {le salarié} {Le salarié} {du salarié} {Du salarié} {au salarié} {Au salarié} {LE SALARIÉ} {Salarié} {Née} {dénommé}
//    et pour n'importe quel mot : {masculin|féminin}  ex. « est {engagé|engagée} », « {ressortissant|ressortissante} français{|e} »
const F = CONFIG.genre === 'F';
const G = {
  'le salarié': F ? 'la Salariée' : 'le Salarié',   'Le salarié': F ? 'La Salariée' : 'Le Salarié',
  'du salarié': F ? 'de la Salariée' : 'du Salarié', 'Du salarié': F ? 'De la Salariée' : 'Du Salarié',
  'au salarié': F ? 'à la Salariée' : 'au Salarié',  'Au salarié': F ? 'À la Salariée' : 'Au Salarié',
  'LE SALARIÉ': F ? 'LA SALARIÉE' : 'LE SALARIÉ',
  'Salarié':    F ? 'Salariée' : 'Salarié',
  'Née':        F ? 'Née' : 'Né',
  'dénommé':    F ? 'dénommée' : 'dénommé',
};
const g = (s) => String(s).replace(/\{([^}]*)\}/g, (m, k) => {
  if (k in G) return G[k];
  if (k.includes('|')) { const [masc, fem] = k.split('|'); return F ? fem : masc; }
  return m;
});

const { couleurFoncee: BRUN, couleurAccent: ACCENT, couleurPapier: PAPIER, couleurGrise: GRIS } = CONFIG;

// Logo facultatif : s'il est absent ou illisible, le nom du client prend sa place.
let LOGO = null;
if (CONFIG.logo) {
  try { LOGO = fs.readFileSync(CONFIG.logo); }
  catch (e) { console.warn('⚠ Logo introuvable (' + CONFIG.logo + ') → mise en page sans logo.'); }
}

// ═══════════════════════════════════════════════════════════════════════════
// Briques de mise en page — ne pas modifier
// ═══════════════════════════════════════════════════════════════════════════
const T = (t, o = {}) => new TextRun({ text: g(t), ...o });
const B = (t) => new TextRun({ text: g(t), bold: true });
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const TRAIT = (c) => ({ style: BorderStyle.SINGLE, size: 2, color: c });

const p = (c, o = {}) => new Paragraph({ children: Array.isArray(c) ? c : [T(g(c))], spacing: { after: 170 }, alignment: AlignmentType.JUSTIFIED, ...o });

const art = (t) => new Paragraph({
  children: [new TextRun({ text: g(t), bold: true, size: 22, color: 'FFFFFF' })],
  shading: { type: ShadingType.CLEAR, fill: BRUN, color: 'auto' },
  spacing: { before: 300, after: 170 }, indent: { left: 90, right: 90 },
});

const li = (t) => new Paragraph({ children: [T(g(t))], numbering: { reference: 'puces', level: 0 }, spacing: { after: 50 }, alignment: AlignmentType.JUSTIFIED });

const filet = (before = 0, after = 120) => new Paragraph({
  children: [], spacing: { before, after },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
});

function fiche(titre, lignes) {
  return new Table({ layout: TableLayoutType.FIXED,
    columnWidths: [2600, 6800], width: { size: 9400, type: WidthType.DXA },
    borders: { top: TRAIT('DDD5CC'), bottom: TRAIT('DDD5CC'), left: TRAIT('DDD5CC'), right: TRAIT('DDD5CC'), insideHorizontal: TRAIT('DDD5CC'), insideVertical: TRAIT('DDD5CC') },
    rows: [
      new TableRow({ children: [new TableCell({
        columnSpan: 2, shading: { type: ShadingType.CLEAR, fill: BRUN, color: 'auto' },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: titre, bold: true, size: 19, color: 'FFFFFF' })] })],
      })] }),
      ...lignes.map(([k, v]) => new TableRow({ children: [
        new TableCell({ width: { size: 2600, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: PAPIER, color: 'auto' },
          margins: { top: 50, bottom: 50, left: 120, right: 100 }, verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: k, size: 18, color: GRIS })] })] }),
        new TableCell({ width: { size: 6800, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [new TextRun({ text: v, size: 19 })] })] }),
      ] })),
    ],
  });
}

// Coin gauche de la première page : le logo du client, ou son nom s'il n'en a pas.
const coinLogo = LOGO
  ? [new Paragraph({ children: [new ImageRun({ data: LOGO, type: 'png', transformation: { width: CONFIG.logoLargeur, height: CONFIG.logoHauteur } })] })]
  : [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: CONFIG.nomClient.toUpperCase(), bold: true, size: 24, color: BRUN })] })];

const headerFirst = new Header({ children: [
  new Table({ layout: TableLayoutType.FIXED,
    columnWidths: [LOGO ? 2400 : 4000, LOGO ? 7000 : 5400], width: { size: 9400, type: WidthType.DXA }, borders: NO_BORDERS,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: LOGO ? 2400 : 4000, type: WidthType.DXA }, borders: NO_BORDERS, verticalAlign: VerticalAlign.CENTER,
        children: coinLogo }),
      new TableCell({ width: { size: LOGO ? 7000 : 5400, type: WidthType.DXA }, borders: NO_BORDERS, verticalAlign: VerticalAlign.CENTER, children: [
        new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 40 }, children: [new TextRun({ text: CONFIG.titre, bold: true, size: 30, color: BRUN })] }),
        new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 40 }, children: [new TextRun({ text: CONFIG.sousTitre, size: 21, color: ACCENT })] }),
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: CONFIG.priseEffet, size: 17, color: GRIS })] }),
      ] }),
    ] })],
  }),
  filet(120, 200),
] });

const headerRest = new Header({ children: [
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 }, children: [
    new TextRun({ text: CONFIG.nomClient, bold: true, size: 16, color: BRUN }),
    new TextRun({ text: '   ·   ' + CONFIG.objetCourant, size: 16, color: GRIS }),
  ] }),
  filet(60, 160),
] });

// Bas de page légal (commun aux deux sections)
const basLegal = () => ([
  new Paragraph({ spacing: { after: 40 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 1 } }, children: [] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: CONFIG.mentionsLegales, size: 13, color: GRIS }),
    new TextRun({ text: CONFIG.adresse + '          Page ', size: 13, color: GRIS, break: 1 }),
    new TextRun({ children: [PageNumber.CURRENT], size: 13, color: GRIS }),
    new TextRun({ text: ' / ', size: 13, color: GRIS }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 13, color: GRIS }),
  ] }),
]);

// Cases de paraphe — de vraies zones où l'on peut écrire (pas des pointillés)
const caseParaphe = (label) => new TableCell({
  width: { size: 1600, type: WidthType.DXA },
  borders: { top: TRAIT('C9BFB5'), bottom: TRAIT('C9BFB5'), left: TRAIT('C9BFB5'), right: TRAIT('C9BFB5') },
  margins: { top: 40, bottom: 380, left: 60, right: 60 },
  children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: label, size: 12, color: '9A9086' })] })],
});

// Pied de page AVEC paraphes — pages courantes
const footerParaphe = new Footer({ children: [
  new Table({ layout: TableLayoutType.FIXED,
    columnWidths: [6200, 1600, 1600], width: { size: 9400, type: WidthType.DXA }, borders: NO_BORDERS,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 6200, type: WidthType.DXA }, borders: NO_BORDERS, verticalAlign: VerticalAlign.BOTTOM,
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 }, children: [new TextRun({ text: 'Paraphes ', size: 14, color: GRIS })] })] }),
      caseParaphe('Employeur'), caseParaphe(g('{Salarié}')),
    ] })],
  }),
  new Paragraph({ children: [], spacing: { after: 40 } }),
  ...basLegal(),
] });

// Pied de page SANS paraphe — page des signatures (règle du cabinet :
// on ne paraphe pas la page que l'on signe)
const footerSignature = new Footer({ children: basLegal() });

const PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: convertMillimetersToTwip(34), bottom: convertMillimetersToTwip(32), left: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20),
            header: convertMillimetersToTwip(10), footer: convertMillimetersToTwip(9) },
  pageNumbers: { formatType: NumberFormat.DECIMAL },
};

// ═══════════════════════════════════════════════════════════════════════════
// ARTICLES — le corps du contrat (adapter au cas)
// ═══════════════════════════════════════════════════════════════════════════
const ARTICLES = [
  p([B('Entre les soussignés :')], { spacing: { after: 130 } }),
  fiche('L’EMPLOYEUR', CONFIG.employeur),
  new Paragraph({ children: [T('ci-après dénommée « l’Employeur », d’une part,', { size: 18, color: GRIS })], spacing: { before: 90, after: 220 } }),
  fiche(g('{LE SALARIÉ}'), CONFIG.salarie.map(([k, v]) => [g(k), g(v)])),
  new Paragraph({ children: [T(g('ci-après {dénommé} « {le salarié} », d’autre part.'), { size: 18, color: GRIS })], spacing: { before: 90, after: 220 } }),
  p('Il a été convenu ce qui suit :'),

  art('ARTICLE 1 — ENGAGEMENT ET FONCTIONS'),
  p('…'),
  li('…'),

  // … ajouter les articles nécessaires au cas (voir le tableau des contrôles dans SKILL.md)
];

// ═══════════════════════════════════════════════════════════════════════════
// Assemblage : section 1 = le contrat, section 2 = la page de signature
// ═══════════════════════════════════════════════════════════════════════════
const blocSignatures = new Table({ layout: TableLayoutType.FIXED,
  columnWidths: [4700, 4700], width: { size: 9400, type: WidthType.DXA },
  borders: { top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT }, bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
             left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT }, right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
             insideVertical: TRAIT('E8DCD2'), insideHorizontal: NONE },
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: 4700, type: WidthType.DXA }, margins: { top: 160, bottom: 1300, left: 170, right: 170 }, children: [
      new Paragraph({ children: [new TextRun({ text: 'Pour l’Employeur', bold: true, size: 20, color: BRUN })], spacing: { after: 60 } }),
      new Paragraph({ children: [new TextRun({ text: CONFIG.signataireEmployeur, size: 18 })], spacing: { after: 60 } }),
      new Paragraph({ children: [new TextRun({ text: '(signature et cachet)', size: 15, color: GRIS, italics: true })] }),
    ] }),
    new TableCell({ width: { size: 4700, type: WidthType.DXA }, margins: { top: 160, bottom: 1300, left: 170, right: 170 }, children: [
      new Paragraph({ children: [new TextRun({ text: g(F ? 'La Salariée' : 'Le Salarié'), bold: true, size: 20, color: BRUN })], spacing: { after: 60 } }),
      new Paragraph({ children: [new TextRun({ text: CONFIG.signataireSalarie, size: 18 })], spacing: { after: 60 } }),
      new Paragraph({ children: [new TextRun({ text: CONFIG.mentionSalarie, size: 15, color: GRIS, italics: true })] }),
    ] }),
  ] })],
});

const doc = new Document({
  numbering: { config: [{ reference: 'puces', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 300 } } } }] }] },
  styles: { default: { document: { run: { font: 'Calibri', size: 20 }, paragraph: { spacing: { line: 276 } } } } },
  sections: [
    { // le contrat : paraphes en pied de page
      properties: { titlePage: true, page: PAGE },
      headers: { first: headerFirst, default: headerRest },
      footers: { default: footerParaphe, first: footerParaphe },
      children: ARTICLES,
    },
    { // la page des signatures : PAS de paraphe
      properties: { page: PAGE },
      headers: { default: headerRest },
      footers: { default: footerSignature },
      children: [
        p(g(CONFIG.lieuDate), { spacing: { before: 200, after: 300 } }),
        blocSignatures,
        ...(CONFIG.annexe ? [new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: g(CONFIG.annexe), size: 16, color: GRIS, italics: true })] })] : []),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(CONFIG.sortie, b);
  console.log('OK →', CONFIG.sortie);
});
