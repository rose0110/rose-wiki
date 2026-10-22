/**
 * paraf-core.mjs — Cœur métier du connecteur Paraf (signature électronique).
 *
 * Fonctions PURES (retournent des données ou lèvent ParafError ; aucun console.log
 * ni process.exit). Partagé par :
 *   - paraf.mjs        (CLI Claude Code)
 *   - mcp-server.mjs   (serveur MCP — « Paraf natif IA »)
 *
 * Auth : clé API pk_live_ (PARAF_API_KEY ou config.json). Détection des champs =
 * ancrage sur le texte du PDF (anchor.mjs) + Gemini en secours, via les endpoints
 * publics-par-jeton prepare.* (tRPC superjson).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractAnchors, buildAnchoredFields, paraphesEveryPage } from "./anchor.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ParafError extends Error {
  constructor(message, httpStatus) { super(message); this.name = "ParafError"; this.httpStatus = httpStatus; }
}

// ── Config ──────────────────────────────────────────────────────────────────
export function loadConfig() {
  let file = {};
  const cfgPath = path.join(__dirname, "config.json");
  try { if (fs.existsSync(cfgPath)) file = JSON.parse(fs.readFileSync(cfgPath, "utf8")); }
  catch (e) { throw new ParafError(`config.json illisible : ${e.message}`); }
  const apiKey = [MASQUÉ] || file.apiKey || "").trim();
  const baseUrl = (process.env.PARAF_BASE_URL || file.baseUrl || "https://paraf.digital").trim().replace(/\/+$/, "");
  const copieTitulaire = (process.env.PARAF_COPIE_TITULAIRE || file.copieTitulaire || "").trim();
  return { apiKey, baseUrl, cfgPath, copieTitulaire };
}
export function requireKey(cfg) {
  if (!cfg.apiKey || !cfg.apiKey.startsWith("pk_"))
    throw new ParafError("Aucune clé API Paraf configurée (config.json → apiKey, ou PARAF_API_KEY).", 401);
}

// ── HTTP : API (clé) + tRPC (jeton, superjson non-batché) ───────────────────
const HINTS = {
  401: "Clé API manquante, inconnue ou révoquée.",
  402: "Le compte Paraf rattaché à la clé n'a pas d'abonnement actif.",
  400: "Requête invalide (PDF non valide, champ manquant…).",
  404: "Demande introuvable (ou pas rattachée à cette clé).",
  409: "Le document n'est pas encore signé par tout le monde.",
  429: "Trop de requêtes (limite 120/min).",
};
async function readJson(r) { const t = await r.text(); try { return JSON.parse(t); } catch { return { raw: t }; } }
async function apiKeyCall(cfg, method, endpoint, body) {
  let r;
  try {
    r = await fetch(cfg.baseUrl + endpoint, {
      method, headers: { Authorization: `Bearer ${cfg.apiKey}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) { throw new ParafError(`Connexion à Paraf impossible (${cfg.baseUrl}) : ${e.message}`); }
  return r;
}
async function trpcQuery(cfg, proc, input) {
  const url = `${cfg.baseUrl}/api/trpc/${proc}?input=` + encodeURIComponent(JSON.stringify({ json: input }));
  let r; try { r = await fetch(url); } catch (e) { throw new ParafError(`tRPC ${proc} injoignable : ${e.message}`); }
  const b = await readJson(r);
  if (!r.ok || b?.error) throw new ParafError(`${proc} : ${b?.error?.json?.message || b?.error?.message || b?.raw || "erreur"}`, r.status);
  return b?.result?.data?.json;
}
async function trpcMutate(cfg, proc, input) {
  let r;
  try { r = await fetch(`${cfg.baseUrl}/api/trpc/${proc}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ json: input }) }); }
  catch (e) { throw new ParafError(`tRPC ${proc} injoignable : ${e.message}`); }
  const b = await readJson(r);
  if (!r.ok || b?.error) throw new ParafError(`${proc} : ${b?.error?.json?.message || b?.error?.message || b?.raw || "erreur"}`, r.status);
  return b?.result?.data?.json;
}

// ── PDF utils ───────────────────────────────────────────────────────────────
export function assertPdf(buf) {
  if (!buf || buf.length < 5 || buf.subarray(0, 5).toString("latin1") !== "%PDF-")
    throw new ParafError("Le fichier n'est pas un PDF valide.", 400);
  if (buf.length > 25 * 1024 * 1024) throw new ParafError("PDF trop volumineux (max 25 Mo).", 400);
}
export async function renderPdfToImages(pdfBuffer, maxPages = 12) {
  const { pdf } = await import("pdf-to-img");
  const doc = await pdf(new Uint8Array(pdfBuffer), { scale: 2 });
  const pages = []; let n = 0;
  for await (const png of doc) { n++; if (n > maxPages) break; pages.push({ pageNumber: n, imageBase64: Buffer.from(png).toString("base64") }); }
  return pages;
}
export async function renderPdfPagesPng(pdfBuffer, scale = 1.6, maxPages = 12) {
  const { pdf } = await import("pdf-to-img");
  const doc = await pdf(new Uint8Array(pdfBuffer), { scale });
  const out = []; let n = 0;
  for await (const png of doc) { n++; if (n > maxPages) break; out.push(Buffer.from(png)); }
  return out;
}

// ── Champs : normalisation (colonnes INTEGER) + mapping IA ──────────────────
const VALID_TYPES = new Set(["signature", "text", "date", "checkbox", "initials", "attachment"]);
const TYPE_MAP = { signature: "signature", initials: "initials", date: "date", mention: "text" };
function clampInt(n) { return Math.max(0, Math.min(100, Math.round(Number(n) || 0))); }
export function normalizeField(f) {
  const type = VALID_TYPES.has(f.type) ? f.type : (TYPE_MAP[f.type] || "text");
  let posX = clampInt(f.posX), posY = clampInt(f.posY);
  let width = Math.max(1, clampInt(f.width)), height = Math.max(1, clampInt(f.height));
  if (posX + width > 100) posX = Math.max(0, 100 - width);
  if (posY + height > 100) posY = Math.max(0, 100 - height);
  const nf = { signatoryId: f.signatoryId, type, page: Math.max(1, Math.round(Number(f.page) || 1)), posX, posY, width, height, required: f.required !== undefined ? !!f.required : type !== "text" };
  if (f.label) nf.label = String(f.label).slice(0, 256);
  if (f.value) nf.value = String(f.value).slice(0, 1000);
  return nf;
}
function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function matchSignatoryId(party, signatories, fallbackIndex) {
  const p = norm(party);
  if (p) {
    let best = null, bestScore = 0;
    for (const s of signatories) {
      const n = norm(s.name); if (!n) continue;
      let score = 0;
      if (n === p) score = 100; else if (n.includes(p) || p.includes(n)) score = 60;
      else { const pt = new Set(p.split(" ")); score = n.split(" ").filter((t) => pt.has(t)).length * 20; }
      if (score > bestScore) { bestScore = score; best = s; }
    }
    if (best && bestScore >= 20) return best.id;
  }
  return signatories[Math.min(fallbackIndex, signatories.length - 1)]?.id;
}
function proposalsToFields(proposals, signatories) {
  return proposals.map((f, i) => normalizeField({
    ...f, type: TYPE_MAP[f.type] || "text",
    signatoryId: matchSignatoryId(f.party, signatories, i % signatories.length),
    label: f.label || (TYPE_MAP[f.type] === "signature" ? "Signature" : TYPE_MAP[f.type] === "initials" ? "Paraphe" : TYPE_MAP[f.type] === "date" ? "Date" : "Mention"),
  }));
}

// ── Aperçu annoté (cadres colorés par signataire) ───────────────────────────
const PALETTE = [[0.11,0.16,0.29],[0.20,0.66,0.63],[0.78,0.66,0.32],[0.72,0.25,0.30],[0.30,0.45,0.70],[0.45,0.35,0.60]];
export async function annotate(pdfBuffer, fields, signatories) {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const doc = await PDFDocument.load(pdfBuffer);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const colorOf = new Map(signatories.map((s, i) => [s.id, PALETTE[i % PALETTE.length]]));
  const pages = doc.getPages();
  for (const f of fields) {
    const pg = pages[f.page - 1]; if (!pg) continue;
    const { width: W, height: H } = pg.getSize();
    const x = (f.posX / 100) * W, w = (f.width / 100) * W, h = (f.height / 100) * H, y = H - ((f.posY + f.height) / 100) * H;
    const [r, g, b] = colorOf.get(f.signatoryId) || [0.4, 0.4, 0.4]; const col = rgb(r, g, b);
    pg.drawRectangle({ x, y, width: w, height: h, borderColor: col, borderWidth: 1.5, color: col, opacity: 0.1 });
    const sig = signatories.find((s) => s.id === f.signatoryId);
    pg.drawText(`${f.label || f.type}${sig ? " · " + sig.name : ""}`.slice(0, 40), { x: x + 1, y: Math.max(2, y - 9), size: 6, font, color: col });
  }
  return await doc.save();
}

// ═══════════════ Opérations haut niveau ═══════════════

/**
 * Crée une demande. mode "auto" (signature en bas + envoi) ou "prepare" (brouillon).
 * Un document : `pdfBuffer` (+ fileName, title). Plusieurs documents signés
 * ensemble SANS fusion (enveloppe : un seul e-mail et un seul lien par
 * signataire) : `documents: [{ pdfBuffer, fileName, title?, type? }]` (1 à 15) ;
 * `title` devient alors le titre de l'enveloppe.
 */
export async function createRequest(cfg, { pdfBuffer, fileName = "document.pdf", title, type, documents, signatories, mode = "auto", message, externalRef, callbackUrl, ccEmails, includeCertificate, requireDrawnSignature, smsVerification }) {
  requireKey(cfg);
  const isEnvelope = Array.isArray(documents) && documents.length > 0;
  if (isEnvelope) {
    if (documents.length > 15) throw new ParafError("Une enveloppe contient au plus 15 documents.", 400);
    documents.forEach((d) => assertPdf(d.pdfBuffer));
  } else assertPdf(pdfBuffer);
  if (!Array.isArray(signatories) || signatories.length === 0) throw new ParafError("Au moins un signataire requis.", 400);
  const cc = Array.isArray(ccEmails) ? ccEmails.filter(Boolean).slice(0, 5) : [];
  const docPart = isEnvelope
    ? {
        documents: documents.map((d) => {
          const fn = d.fileName || "document.pdf";
          return { base64: d.pdfBuffer.toString("base64"), fileName: fn, title: d.title || fn.replace(/\.pdf$/i, ""), ...(d.type ? { type: d.type } : {}) };
        }),
        ...(title ? { title } : {}),
      }
    : { document: { base64: pdfBuffer.toString("base64"), fileName, title: title || fileName.replace(/\.pdf$/i, ""), ...(type ? { type } : {}) } };
  const body = {
    ...docPart,
    signatories, mode, ...(message ? { message } : {}), ...(externalRef ? { externalRef } : {}), ...(callbackUrl ? { callbackUrl } : {}),
    // Destinataires en copie : prévenus de l'envoi et de chaque signature, puis
    // destinataires du PDF signé. Ils ne signent pas.
    ...(cc.length ? { ccEmails: cc } : {}),
    // Depuis la décision de Rose du 10/10/2026, Paraf n'envoie plus la copie du PDF
    // signé au titulaire du compte pour une demande créée par l'API : on la
    // redemande explicitement (config.json « copieTitulaire ») pour que Rose
    // continue de recevoir l'exemplaire des documents qu'elle envoie elle-même.
    ...(cfg.copieTitulaire ? { completionEmail: cfg.copieTitulaire } : {}),
    // Page de certificat annexée au PDF signé (défaut serveur : true).
    ...(includeCertificate === false ? { includeCertificate: false } : {}),
    // Signature tracée à la main obligatoire : le parcours de signature n'expose
    // alors que le canvas (ni modèle de police, ni import d'image).
    ...(requireDrawnSignature === true ? { requireDrawnSignature: true } : {}),
    // Option payante (0,10 € HT par signataire) : code SMS à saisir avant de
    // signer. Chaque signataire doit alors avoir un mobile (sauf l'expéditeur).
    ...(smsVerification === true ? { smsVerification: true } : {}),
  };
  const r = await apiKeyCall(cfg, "POST", "/api/integration/signatures", body);
  const d = await readJson(r);
  if (!r.ok) throw new ParafError(`${HINTS[r.status] || "Erreur"} ${d.message || ""}`.trim(), r.status);
  const token = [MASQUÉ] || "").split("/prepare/")[1] || null;
  return { ...d, token };
}

/** Détecte + place les champs (ancrage texte + Gemini). Renvoie fields + aperçu. */
export async function detectFields(cfg, { token, pdfBuffer, documentId, maxPages = 12, useAnchor = true, useAI = true, anchorOnly = false, mentions = false, noInitials = false, initialsSkipPages = [] }) {
  requireKey(cfg); assertPdf(pdfBuffer);
  const mp = Math.min(12, maxPages || 12);
  // Enveloppe : `documentId` désigne le document de l'enveloppe à traiter (le PDF passé doit être celui-là).
  const info = await getPreparation(cfg, token, documentId);
  assertDocumentChosen(info, documentId);
  const signatories = info.signatories || [];
  if (!signatories.length) throw new ParafError("Aucun signataire sur ce brouillon.", 400);

  let anchorFields = [], hasTextLayer = false;
  if (useAnchor) {
    const anchors = await extractAnchors(pdfBuffer);
    hasTextLayer = anchors.items.length >= 6;
    if (hasTextLayer) {
      const built = buildAnchoredFields(anchors, signatories, { mentions }); // mention « Lu et approuvé » = opt-in
      const pageNums = anchors.pages.map((p) => p.num).slice(0, mp);
      const initials = noInitials ? [] : paraphesEveryPage(pageNums, signatories, initialsSkipPages); // ex: sauter une annexe/RIB
      anchorFields = [...built.fields, ...initials].map(normalizeField);
    }
  }
  let aiFields = [];
  if (useAI && (!hasTextLayer || !anchorOnly)) {
    const pages = await renderPdfToImages(pdfBuffer, mp);
    const res = await trpcMutate(cfg, "prepare.suggestFields", { token, pages });
    if (Array.isArray(res?.proposals)) aiFields = proposalsToFields(res.proposals, signatories);
  }
  const key = (f) => `${f.type}|${f.page}|${f.signatoryId}`;
  const seen = new Set(anchorFields.map(key));
  const fields = [...anchorFields];
  for (const f of aiFields) if (!seen.has(key(f))) { seen.add(key(f)); fields.push(f); }
  fields.forEach((f) => delete f._src);

  const previewBytes = fields.length ? await annotate(pdfBuffer, fields, signatories) : null;
  return { document: info.document, signatories, fields, previewBytes, source: { anchored: anchorFields.length, ai: fields.length - anchorFields.length, textLayer: hasTextLayer } };
}

/**
 * Infos d'un brouillon par jeton (document + signataires + champs existants).
 * Enveloppe : `documents` liste tous ses documents ; `document`/`fields` sont
 * ceux de `documentId` (le premier par défaut).
 */
export async function getPreparation(cfg, token, documentId) {
  return await trpcQuery(cfg, "prepare.getByToken", { token, ...(documentId ? { documentId: Number(documentId) } : {}) });
}

/** Enveloppe de plusieurs documents : refuse d'agir sans savoir sur lequel. */
function assertDocumentChosen(info, documentId) {
  const docs = info?.documents;
  if (Array.isArray(docs) && docs.length > 1 && !documentId) {
    throw new ParafError(
      `Enveloppe de ${docs.length} documents : précise --document <id> parmi ${docs.map((d) => `${d.id} (« ${d.title} »)`).join(", ")}.`,
      400,
    );
  }
}

export async function saveFields(cfg, { token, fields, documentId }) {
  if (!Array.isArray(fields) || !fields.length) throw new ParafError("Aucun champ à enregistrer.", 400);
  const norm2 = fields.map(normalizeField);
  for (const f of norm2) if (!Number.isInteger(f.signatoryId)) throw new ParafError(`signatoryId invalide : ${JSON.stringify(f)}`, 400);
  const res = await trpcMutate(cfg, "prepare.saveFields", { token, fields: norm2, ...(documentId ? { documentId: Number(documentId) } : {}) });
  if (res?.success !== true) throw new ParafError(`prepare.saveFields : réponse inattendue (${JSON.stringify(res)?.slice(0, 200)}).`);
  if (documentId && res.documentId !== undefined && Number(res.documentId) !== Number(documentId)) {
    throw new ParafError(`prepare.saveFields : enregistré sur le document ${res.documentId} au lieu de ${documentId}.`);
  }
  // Relecture en base : jamais « enregistré » sans les champs réellement là
  // (incident du 12/10/2026 : succès annoncé sur le document 218, rien en base).
  const verifies = await verifySavedFields(cfg, { token, documentId, fields: norm2 });
  return { saved: norm2.length, verified: verifies };
}

const cleChamp = (f) => [f.signatoryId, f.type, f.page, f.posX, f.posY, f.width, f.height].join("|");
/** Relit les champs du document et lève une erreur s'ils ne sont pas exactement ceux envoyés. */
export async function verifySavedFields(cfg, { token, documentId, fields }) {
  const info = await getPreparation(cfg, token, documentId);
  const docLu = info?.document?.id;
  if (documentId && docLu !== undefined && Number(docLu) !== Number(documentId)) {
    throw new ParafError(`Relecture : le serveur a renvoyé le document ${docLu} au lieu de ${documentId}.`);
  }
  const enBase = (info?.fields || []).map(cleChamp).sort();
  const envoyes = fields.map(cleChamp).sort();
  const cible = documentId ? `le document ${documentId}` : "le document";
  if (enBase.length !== envoyes.length || enBase.some((k, i) => k !== envoyes[i])) {
    const ecart = enBase.length !== envoyes.length
      ? `${enBase.length} champ(s) en base au lieu de ${envoyes.length}`
      : "les champs en base ne sont pas ceux envoyés (positions ou signataires différents)";
    throw new ParafError(`Enregistrement NON confirmé sur ${cible} : ${ecart}. Rien n'est envoyé ; relance save-fields.`);
  }
  return enBase.length;
}
export async function sendPrepared(cfg, { token }) { await trpcMutate(cfg, "prepare.send", { token }); return { sent: true }; }

export async function getStatus(cfg, { id }) {
  requireKey(cfg);
  const r = await apiKeyCall(cfg, "GET", `/api/integration/signatures/${encodeURIComponent(id)}`);
  const d = await readJson(r);
  if (!r.ok) throw new ParafError(`${HINTS[r.status] || "Erreur"} ${d.message || ""}`.trim(), r.status);
  return d;
}
/**
 * Renvoie l'email d'invitation aux signataires en attente.
 * Sans `email`, relance tout le monde ; avec, uniquement celui-là.
 * Le serveur refuse une seconde relance du même signataire en moins d'une
 * heure (motif `too_soon`) — c'est un garde-fou, pas une erreur.
 */
export async function remindRequest(cfg, { id, email }) {
  requireKey(cfg);
  const r = await apiKeyCall(cfg, "POST", `/api/integration/signatures/${encodeURIComponent(id)}/remind`, email ? { email } : {});
  const d = await readJson(r);
  // Ici le message du serveur est plus juste que le hint générique : sur cette
  // route, 409 veut dire « la demande n'attend plus de signature », et non
  // « pas encore signé par tout le monde ».
  if (!r.ok) throw new ParafError(d.message || HINTS[r.status] || "Erreur", r.status);
  return d;
}

/**
 * Annule une demande partie par erreur : le lien de signature cesse de
 * fonctionner et l'application tierce est prévenue (webhook signature.cancelled).
 * Un document DÉJÀ SIGNÉ ne s'annule pas (409 already_completed) : c'est une
 * preuve. Ré-annuler est sans effet (`alreadyCancelled: true`), pas une erreur.
 */
export async function cancelRequest(cfg, { id, reason }) {
  requireKey(cfg);
  const r = await apiKeyCall(cfg, "POST", `/api/integration/signatures/${encodeURIComponent(id)}/cancel`, reason ? { reason } : {});
  const d = await readJson(r);
  // Sur cette route, 409 veut dire « déjà signé » ou « enveloppe non gérée » :
  // le message du serveur est plus juste que le hint générique.
  if (!r.ok) throw new ParafError(d.message || HINTS[r.status] || "Erreur", r.status);
  return d;
}

/**
 * PDF signé + certificat. Enveloppe : un PDF par document (`documentId`, ids
 * donnés par getStatus → documents[]) ; sans documentId sur une enveloppe de
 * plusieurs documents, le serveur répond 400 avec la liste.
 */
export async function downloadSigned(cfg, { id, documentId }) {
  requireKey(cfg);
  const q = documentId ? `?documentId=${encodeURIComponent(documentId)}` : "";
  const r = await apiKeyCall(cfg, "GET", `/api/integration/signatures/${encodeURIComponent(id)}/document${q}`);
  if (!r.ok) { const d = await readJson(r); throw new ParafError(`${HINTS[r.status] || "Erreur"} ${d.message || ""}`.trim(), r.status); }
  const bytes = Buffer.from(await r.arrayBuffer());
  return { bytes, hash: r.headers.get("x-paraf-signed-hash") || "", filename: documentId ? `paraf-${id}-${documentId}-signe.pdf` : `paraf-${id}-signe.pdf` };
}
