// Enveloppe Annette (FECHKAH) : AER France Travail corrigée (8 p., section 7 renseignée) + certificat
// de travail (1 p.), cachet HD des Berceaux posé sur la page 8 de l'AER (cadre « Cachet de l'entreprise »)
// et dans le cadre « Signature et cachet de l'employeur » du certificat. Signature d'Annette par Paraf.
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const DIR = 'C:/Users/roses/Downloads/alicia-sortie/';
const MM = 72 / 25.4;
const aer = await PDFDocument.load(readFileSync(DIR + 'attestation-France-Travail-FECHKAH-section7.pdf'));
const certif = await PDFDocument.load(readFileSync(DIR + 'certificat-de-travail-FECHKAH.pdf'));
const out = await PDFDocument.create();
const cachetPng = readFileSync(DIR + 'cachet-berceaux-HD.png');

// aplatir les champs de formulaire de l'AER (valeurs figées, pas de widgets modifiables dans l'enveloppe)
try { aer.getForm().flatten(); } catch (e) { console.log('flatten AER :', e.message); }

const pagesAer = await out.copyPages(aer, aer.getPageIndices());
for (const p of pagesAer) out.addPage(p);
const [pageCertif] = await out.copyPages(certif, [0]);
out.addPage(pageCertif);
const img = await out.embedPng(cachetPng);

// AER page 8 : cadre « Cachet de l'entreprise » ≈ x 406→553 pt, y (haut) 364→446 pt → cachet 36 mm centré
{
  const p = out.getPage(7);
  const { height } = p.getSize();
  const w = 36 * MM;
  const cx = (406 + 553) / 2, cyTop = (364 + 446) / 2;
  p.drawImage(img, { x: cx - w / 2, y: height - cyTop - w / 2, width: w, height: w });
}
// Certificat : cadre « Signature et cachet de l'employeur » ≈ x 310→555 pt, y (haut) 662→790 pt → cachet 42 mm à droite
{
  const p = out.getPage(8);
  const { height } = p.getSize();
  const w = 42 * MM;
  const x = 545 - w, yTop = 668;
  p.drawImage(img, { x, y: height - yTop - w, width: w, height: w });
}
out.setTitle('FECHKAH Alicia - attestation France Travail et certificat de travail');
const bytes = await out.save();
writeFileSync(DIR + 'Alicia-FECHKAH-documents-a-signer.pdf', bytes);
console.log('ecrit', DIR + 'Alicia-FECHKAH-documents-a-signer.pdf', bytes.length, 'octets,', out.getPageCount(), 'pages');
