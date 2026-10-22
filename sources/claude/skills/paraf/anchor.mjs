/**
 * anchor.mjs — Ancrage des champs sur le TEXTE réel du PDF (positions exactes).
 *
 * Pour les documents « texte » (contrats, attestations générés), on lit la couche
 * texte via pdfjs et on pose les champs PILE sur les repères (traits « ____ »,
 * intitulés « Le salarié / Pour la société / Fait à … le … / Lu et approuvé »),
 * au lieu de deviner par vision. Bien plus précis. Pour les scans (pas de couche
 * texte), extractAnchors renvoie peu d'items → l'appelant retombe sur Gemini.
 */

// ── Extraction texte + positions (en % de page, origine haut-gauche) ────────
export async function extractAnchors(pdfBuffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(pdfBuffer), useSystemFonts: true }).promise;
  const pages = [];
  const items = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: 1 });
    pages.push({ num: p, width: vp.width, height: vp.height });
    const tc = await page.getTextContent();
    for (const it of tc.items) {
      const str = (it.str || "").replace(/\s+/g, " ").trim();
      if (!str) continue;
      const e = it.transform[4], f = it.transform[5];
      items.push({
        page: p,
        str,
        xPct: (e / vp.width) * 100,
        yTopPct: ((vp.height - f) / vp.height) * 100, // ligne de base, vue du haut
        wPct: ((it.width || 0) / vp.width) * 100,
        hPct: ((it.height || 0) / vp.height) * 100,
      });
    }
  }
  return { pages, items };
}

// ── Dictionnaires de repères ────────────────────────────────────────────────
const UNDERSCORE = /_{4,}/;
const SIGN_LABEL = /\b(le|la|l['e ]?|pour|au nom de)\b.*?(salari|employ[ée]|soussign|mandant|mandataire|bailleur|locataire|vendeur|acheteur|client|prestataire|g[ée]rant|pr[ée]sident|directeur|entreprise|soci[ée]t[ée])|pour (la soci[ée]t[ée]|l['e ]entreprise|le compte)|bon pour accord|lu et approuv|^signature\b/i;
const DATE_LINE = /(fait\s+[àa]\b.*\ble\b)|(\ble\b\s*_{2,})|(^date\b)|(sign[ée]\s+le\b)/i;
const MENTION = /(lu et approuv|bon pour accord)/i;

// mots-clés par rôle, pour rattacher un intitulé au bon signataire
const ROLE_KEYS = {
  salarie: ["salari", "employe", "employé", "salariee", "collaborateur"],
  employeur: ["employeur", "societe", "société", "entreprise", "pour la", "gerant", "president", "directeur", "mandant"],
  client: ["client", "acheteur", "preneur"],
  prestataire: ["prestataire", "vendeur", "mandataire", "bailleur"],
};
function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function labelMatchesSignatory(labelText, sig) {
  const lt = norm(labelText);
  const hay = norm((sig.role || "") + " " + (sig.name || ""));
  let score = 0;
  for (const [, keys] of Object.entries(ROLE_KEYS)) {
    const inLabel = keys.some((k) => lt.includes(norm(k)));
    const inSig = keys.some((k) => hay.includes(norm(k)));
    if (inLabel && inSig) score += 50;
  }
  // nom propre présent dans le label ?
  for (const w of norm(sig.name).split(/\s+/)) if (w.length > 2 && lt.includes(w)) score += 30;
  return score;
}

// ── Construction des champs par ancrage ─────────────────────────────────────
/**
 * @returns { fields: [...], coverage: { signature, date, mention } }
 * fields : { signatoryId, type, page, posX, posY, width, height, label?, value?, required, _src:"anchor" }
 */
export function buildAnchoredFields({ items }, signatories, opts = {}) {
  const fields = [];
  const cover = { signature: false, date: false, mention: false };
  if (!items || items.length < 3) return { fields, coverage: cover };

  // 1) Traits de signature (underscores) + intitulé le plus proche au-dessus.
  //    On exclut les lignes de DATE (« Fait à … le … ») : ce ne sont pas des
  //    zones de signature même si elles contiennent des « ____ ».
  const underscores = items.filter((it) => UNDERSCORE.test(it.str) && it.wPct > 8 && !DATE_LINE.test(it.str));
  // Intitulés candidats : courts (un intitulé, pas une phrase du corps) et non-date.
  const labels = items.filter((it) => it.str.length <= 34 && SIGN_LABEL.test(it.str) && !UNDERSCORE.test(it.str) && !DATE_LINE.test(it.str));

  // paires (trait, intitulé) : intitulé juste au-dessus, même colonne
  const sigSpots = [];
  for (const u of underscores) {
    let lab = null, best = 1e9;
    for (const l of labels) {
      if (l.page !== u.page) continue;
      const dy = u.yTopPct - l.yTopPct;            // intitulé au-dessus
      const dx = Math.abs(l.xPct - u.xPct);
      if (dy > 0.2 && dy < 14 && dx < 30 && dy < best) { best = dy; lab = l; } // 14% : couvre les espaces de signature réalistes
    }
    sigSpots.push({ u, lab });
  }
  // intitulés sans trait (on signera juste sous l'intitulé)
  const usedLabels = new Set(sigSpots.map((s) => s.lab).filter(Boolean));
  for (const l of labels) {
    if (usedLabels.has(l)) continue;
    if (MENTION.test(l.str)) continue; // « lu et approuvé » = mention, pas signature
    sigSpots.push({ u: null, lab: l });
  }

  // Association spot → signataire
  const orderByPos = (a, b) => (a.page - b.page) || (a.yTopPct - b.yTopPct) || (a.xPct - b.xPct);
  sigSpots.sort((A, B) => orderByPos(A.u || A.lab, B.u || B.lab));
  let seq = 0;
  for (const spot of sigSpots) {
    const ref = spot.u || spot.lab;
    if (!ref) continue;
    // meilleur signataire par intitulé, sinon par ordre d'apparition
    let sig = null, bestScore = 0;
    if (spot.lab) for (const s of signatories) { const sc = labelMatchesSignatory(spot.lab.str, s); if (sc > bestScore) { bestScore = sc; sig = s; } }
    if (!sig) sig = signatories[seq % signatories.length];
    seq++;

    const height = 7;
    let posX, posY, width;
    if (spot.u) { // pose la signature JUSTE au-dessus du trait
      width = Math.min(38, Math.max(20, spot.u.wPct));
      posX = spot.u.xPct;
      posY = spot.u.yTopPct - height;
    } else {      // sous l'intitulé
      width = 28;
      posX = spot.lab.xPct;
      posY = spot.lab.yTopPct + 1.5;
    }
    fields.push(mk(sig.id, "signature", ref.page, posX, posY, width, height, spot.lab ? spot.lab.str.slice(0, 40) : "Signature"));
    cover.signature = true;
  }

  // 2) Dates : ligne « Fait à … le … » → caler la date juste APRÈS « le », sur la ligne
  for (const it of items) {
    if (!DATE_LINE.test(it.str)) continue;
    const m = it.str.match(/\ble\b[\s_./]*/i); // position du « le » (+ blancs/underscores qui suivent)
    const startRatio = m ? (m.index + m[0].length) / it.str.length : 0.5;
    const posX = it.xPct + startRatio * it.wPct;
    const width = Math.min(22, Math.max(12, it.wPct * (1 - startRatio)));
    const posY = it.yTopPct - 3.5; // le cadre repose sur la ligne de texte
    const sig = signatories[0];
    fields.push(mk(sig.id, "date", it.page, posX, posY, width, 3.5, "Date"));
    cover.date = true;
  }

  // 3) Mention « Lu et approuvé » — OPT-IN (opts.mentions). Désactivée par défaut :
  //    en signature électronique la mention pré-remplie n'a pas de valeur ajoutée, et
  //    « bon pour accord » se retrouve souvent dans une simple instruction du document
  //    (« précédée de la mention … ») — ce qui créait un champ parasite. Filtres
  //    supplémentaires quand activée : intitulé court, pas une phrase d'instruction.
  if (opts.mentions) {
    for (const it of items) {
      if (!MENTION.test(it.str)) continue;
      if (it.str.length > 22) continue;                                  // trop long → instruction, pas un label
      if (/mention|pr[eé]c[eé]d|doit|faire|suivie? de|manuscrit/i.test(it.str)) continue;
      const sig = signatories[0];
      fields.push(mk(sig.id, "text", it.page, it.xPct, it.yTopPct + 1.5, Math.min(30, Math.max(18, it.wPct)), 4, "Lu et approuvé", "Lu et approuvé", false));
      cover.mention = true;
    }
  }

  // Dédup : au plus 1 champ par (type,page,signataire) — garder le label le plus spécifique
  const dedup = new Map();
  for (const f of fields) {
    const k = `${f.type}|${f.page}|${f.signatoryId}`;
    const cur = dedup.get(k);
    const generic = (t) => !t || /^signature$/i.test(t);
    if (!cur || (!generic(f.label) && generic(cur.label))) dedup.set(k, f);
  }
  return { fields: [...dedup.values()], coverage: cover };
}

// Paraphe déterministe en bas de CHAQUE page, pour chaque signataire
export function paraphesEveryPage(pageNums, signatories, skipPages = []) {
  const skip = new Set((skipPages || []).map(Number));
  const fields = [];
  for (const p of pageNums) {
    if (skip.has(Number(p))) continue;                 // ne pas parapher les pages exclues (ex. annexes / RIB joint)
    signatories.forEach((s, i) => {
      fields.push(mk(s.id, "initials", p, 8 + i * 13, 94, 11, 5, "Paraphe"));
    });
  }
  return fields;
}

function mk(signatoryId, type, page, posX, posY, width, height, label, value, required) {
  const f = {
    signatoryId, type, page: Math.max(1, Math.round(page)),
    posX: clamp(posX), posY: clamp(posY),
    width: Math.max(1, clamp(width)), height: Math.max(1, clamp(height)),
    required: required === undefined ? type !== "text" : required,
    _src: "anchor",
  };
  if (f.posX + f.width > 100) f.posX = Math.max(0, 100 - f.width);
  if (f.posY + f.height > 100) f.posY = Math.max(0, 100 - f.height);
  if (label) f.label = String(label).slice(0, 256);
  if (value) f.value = String(value).slice(0, 1000);
  return f;
}
function clamp(n) { return Math.max(0, Math.min(100, Math.round(Number(n) || 0))); }
