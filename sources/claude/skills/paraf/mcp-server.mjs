#!/usr/bin/env node
/**
 * mcp-server.mjs — Serveur MCP « Paraf » : signature électronique native-IA.
 *
 * Expose la signature Paraf comme des OUTILS que n'importe quel client MCP
 * (Claude Desktop, Claude Code, ChatGPT, agents…) peut appeler en langage naturel.
 * Différenciateur : `paraf_detect_fields` place signature/paraphe/date TOUT SEUL
 * sur un PDF quelconque (ancrage texte + IA), sans template ni coordonnées.
 *
 * POC LOCAL (stdio). Auth = clé API pk_live_ (config.json ou PARAF_API_KEY).
 * Pour la version produit : héberger en remote + OAuth « Se connecter avec Paraf ».
 *
 * Lancement : node mcp-server.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as core from "./paraf-core.mjs";

const cfg = core.loadConfig();
const server = new McpServer({ name: "paraf", version: "0.1.0" });

// Helpers de réponse
const txt = (s) => ({ content: [{ type: "text", text: s }] });
const err = (e) => ({ content: [{ type: "text", text: `❌ ${e?.message || e}` }], isError: true });
function readPdf(pdfPath) {
  if (!pdfPath) throw new core.ParafError("Chemin du PDF manquant.");
  if (!fs.existsSync(pdfPath)) throw new core.ParafError(`Fichier introuvable : ${pdfPath}`);
  const buf = fs.readFileSync(pdfPath);
  core.assertPdf(buf);
  return buf;
}
const signatorySchema = z.object({
  name: z.string().min(1).describe("Nom complet du signataire"),
  email: z.string().email().describe("Email du signataire"),
  role: z.string().optional().describe("Rôle : Salarié, Employeur, Client…"),
});
const fieldSchema = z.object({
  signatoryId: z.number().int(),
  type: z.enum(["signature", "initials", "date", "text", "checkbox", "attachment"]),
  page: z.number().int().min(1),
  posX: z.number(), posY: z.number(), width: z.number(), height: z.number(),
  label: z.string().optional(), value: z.string().optional(), required: z.boolean().optional(),
});

// ── 1) Créer une demande ────────────────────────────────────────────────────
server.registerTool("paraf_create_signature_request", {
  title: "Créer une demande de signature",
  description:
    "Crée une demande de signature Paraf à partir d'un PDF local. mode='prepare' (défaut recommandé) " +
    "crée un brouillon SANS envoyer, pour ensuite placer les champs avec paraf_detect_fields puis paraf_send. " +
    "mode='auto' pose une signature en bas de la dernière page et envoie immédiatement les emails. " +
    "Renvoie signatureRequestId (=id) et token (pour detect/save/send).",
  inputSchema: {
    pdfPath: z.string().describe("Chemin du fichier PDF à faire signer"),
    signatories: z.array(signatorySchema).min(1).max(10),
    title: z.string().optional(),
    mode: z.enum(["prepare", "auto"]).default("prepare"),
    message: z.string().optional(),
    type: z.string().optional().describe("Type libre : contrat, bulletin, attestation…"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
}, async ({ pdfPath, signatories, title, mode, message, type }) => {
  try {
    const buf = readPdf(pdfPath);
    const d = await core.createRequest(cfg, { pdfBuffer: buf, fileName: path.basename(pdfPath), title, type, signatories, mode, message });
    const lines = [
      `✅ Demande créée — id ${d.signatureRequestId}, statut ${d.status}, mode ${mode}.`,
      d.token ? `token : [MASQUÉ] : "",
      mode === "auto" ? "📧 Emails envoyés (signature auto en bas)." : "📝 Brouillon : appelle paraf_detect_fields puis paraf_send.",
      "", JSON.stringify({ signatureRequestId: d.signatureRequestId, token: [MASQUÉ], status: d.status, signatories: d.signatories }),
    ].filter(Boolean);
    return txt(lines.join("\n"));
  } catch (e) { return err(e); }
});

// ── 2) Détecter + placer les champs (le super-pouvoir) ──────────────────────
server.registerTool("paraf_detect_fields", {
  title: "Détecter et placer les champs (IA)",
  description:
    "LE point fort de Paraf : place automatiquement signature, paraphe (chaque page) et date " +
    "sur un PDF quelconque, au bon endroit et au bon signataire — sans template. Combine l'ancrage sur le " +
    "texte du PDF (précis) et la détection IA (Gemini, secours pour les scans). Renvoie le tableau `fields` " +
    "(à ajuster si besoin) ET une image d'aperçu annoté. À utiliser sur un brouillon (mode prepare) avant paraf_send.\n" +
    "RECETTES ÉPROUVÉES (terrain) — évite des erreurs connues :\n" +
    "• ANNEXE (RIB, pièce jointe fusionnée en fin de PDF) : NE PAS la parapher → passer sa/ses page(s) dans initialsSkipPages (ex: [7]).\n" +
    "• MENTION « Lu et approuvé » : inutile en signature électronique et se déclenche à tort sur une simple instruction du doc → laissée OFF ; n'activer mentions:true que si explicitement demandé.\n" +
    "• DOC À 2 COLONNES (client à gauche / prestataire à droite) : l'ancrage associe MAL les colonnes quand l'intitulé est long (ex: « POUR SMART DATA PAY — LE PRESTATAIRE »). Dans ce cas, IGNORER l'auto et poser les 4 champs À LA MAIN via paraf_save_fields — gauche x≈9–34, droite x≈55–80 (voir l'exemple dans la description de paraf_save_fields).\n" +
    "TOUJOURS faire valider l'image d'aperçu par un humain avant paraf_send.",
  inputSchema: {
    token: [MASQUÉ]"token du brouillon (renvoyé par paraf_create_signature_request)"),
    pdfPath: z.string().describe("Chemin du même PDF"),
    anchorOnly: z.boolean().default(false).describe("true = ancrage texte seul (rapide, sans coût IA)"),
    mentions: z.boolean().default(false).describe("Ajouter la mention « Lu et approuvé » (opt-in ; inutile en signature électronique)"),
    noInitials: z.boolean().default(false).describe("Ne poser aucun paraphe"),
    initialsSkipPages: z.array(z.number().int()).default([]).describe("Pages à NE PAS parapher (ex: une annexe/RIB jointe)"),
    previewPages: z.number().int().min(1).max(4).default(2).describe("Nb de pages d'aperçu à renvoyer en image"),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
}, async ({ token, pdfPath, anchorOnly, mentions, noInitials, initialsSkipPages, previewPages }) => {
  try {
    const buf = readPdf(pdfPath);
    const r = await core.detectFields(cfg, { token, pdfBuffer: buf, anchorOnly, mentions, noInitials, initialsSkipPages });
    const content = [];
    const summary = r.fields.map((f) => {
      const s = r.signatories.find((x) => x.id === f.signatoryId);
      return `• p.${f.page} ${f.type} — ${s ? s.name : "?"} (x${f.posX} y${f.posY} ${f.width}×${f.height}) ${f.label || ""}`;
    }).join("\n");
    content.push({ type: "text", text: `🔎 ${r.fields.length} champ(s) (${r.source.anchored} ancrés + ${r.source.ai} IA) :\n${summary}\n\n${JSON.stringify({ signatories: r.signatories, fields: r.fields })}` });
    if (r.previewBytes) {
      const pngs = await core.renderPdfPagesPng(r.previewBytes, 1.4, previewPages);
      for (const png of pngs) content.push({ type: "image", data: png.toString("base64"), mimeType: "image/png" });
    }
    return { content };
  } catch (e) { return err(e); }
});

// ── 3) Enregistrer les champs (après validation/ajustement) ─────────────────
server.registerTool("paraf_save_fields", {
  title: "Enregistrer les champs",
  description:
    "Enregistre le tableau de champs sur le brouillon (après validation humaine ou ajustement des positions). N'envoie pas encore.\n" +
    "Champ = { signatoryId (entier issu de detect), type (signature|initials|date|text|checkbox), page, posX, posY, width, height }. " +
    "posX/posY/width/height = ENTIERS en % de page, origine coin HAUT-GAUCHE.\n" +
    "RECETTE 2 COLONNES (placement manuel quand l'auto se trompe) — client à gauche, prestataire à droite, ex. page 6 :\n" +
    '[{"signatoryId":<CLIENT>,"type":"date","page":6,"posX":15,"posY":70,"width":19,"height":3},' +
    '{"signatoryId":<CLIENT>,"type":"signature","page":6,"posX":9,"posY":79,"width":26,"height":4},' +
    '{"signatoryId":<PRESTATAIRE>,"type":"date","page":6,"posX":61,"posY":70,"width":19,"height":3},' +
    '{"signatoryId":<PRESTATAIRE>,"type":"signature","page":6,"posX":55,"posY":79,"width":26,"height":4}] ' +
    "— gauche x≈9–34, droite x≈55–80 ; ajuster posY selon le layout puis re-vérifier via paraf_detect_fields/aperçu.",
  inputSchema: { token: [MASQUÉ], fields: z.array(fieldSchema).min(1) },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
}, async ({ token, fields }) => {
  try { const r = await core.saveFields(cfg, { token, fields }); return txt(`✅ ${r.saved} champ(s) enregistré(s).`); }
  catch (e) { return err(e); }
});

// ── 4) Envoyer (EFFET RÉEL — confirmation humaine requise) ───────────────────
server.registerTool("paraf_send", {
  title: "Envoyer pour signature (effet réel)",
  description:
    "⚠️ ENVOI RÉEL : passe le document en attente et envoie les emails d'invitation aux signataires. " +
    "Acte à valeur légale — NE PAS appeler sans confirmation explicite de l'utilisateur. " +
    "À utiliser après paraf_save_fields sur un brouillon.",
  inputSchema: { token: [MASQUÉ] },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
}, async ({ token }) => {
  try { await core.sendPrepared(cfg, { token }); return txt("✅ Document envoyé — emails d'invitation partis. Suis avec paraf_get_status."); }
  catch (e) { return err(e); }
});

// ── 5) Statut ────────────────────────────────────────────────────────────────
server.registerTool("paraf_get_status", {
  title: "Statut d'une demande",
  description: "Renvoie l'avancement d'une demande (par id = signatureRequestId) : statut global + par signataire, et si le document signé est prêt.",
  inputSchema: { id: z.number().int().describe("signatureRequestId") },
  annotations: { readOnlyHint: true, openWorldHint: true },
}, async ({ id }) => {
  try {
    const d = await core.getStatus(cfg, { id });
    const per = (d.signatories || []).map((s) => `• ${s.name} <${s.email}> : ${s.status}${s.signedAt ? ` (le ${s.signedAt})` : ""}`).join("\n");
    return txt(`📄 #${d.signatureRequestId} — ${d.status}${d.documentReady ? " (signé prêt ✅)" : ""}\n${per}\n\n${JSON.stringify(d)}`);
  } catch (e) { return err(e); }
});

// ── 6) Annuler (EFFET RÉEL — le lien de signature cesse de fonctionner) ──────
server.registerTool("paraf_cancel", {
  title: "Annuler une demande de signature",
  description:
    "⚠️ ANNULE une demande : le lien cesse de fonctionner, les signataires ne peuvent plus signer. " +
    "Pour une demande partie par erreur (mauvais document, mauvais destinataire). " +
    "NE PAS appeler sans confirmation explicite de l'utilisateur : une demande annulée ne se " +
    "réactive pas, il faut en recréer une.\n" +
    "Un document DÉJÀ SIGNÉ n'est pas annulable (c'est une preuve). Ré-annuler ne fait rien.\n" +
    "Paraf n'envoie AUCUN email d'annulation : proposer à l'utilisateur de prévenir lui-même " +
    "ceux qui attendaient — la réponse dit qui n'avait pas signé.",
  inputSchema: {
    id: z.number().int().describe("signatureRequestId"),
    reason: z.string().optional().describe("Motif, consigné au journal d'audit (jamais transmis aux signataires)"),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
}, async ({ id, reason }) => {
  try {
    const d = await core.cancelRequest(cfg, { id, reason });
    if (d.alreadyCancelled) return txt(`ℹ️ #${d.signatureRequestId} : déjà annulée, rien à faire.\n\n${JSON.stringify(d)}`);
    const restants = d.cancelledSignatories || [];
    const qui = restants.length
      ? `\n${restants.length} signataire(s) n'avaient pas signé :\n` +
        restants.map((s) => `• ${s.name} <${s.email}>`).join("\n") +
        `\nParaf ne les prévient PAS : proposer à l'utilisateur de le faire.`
      : "";
    return txt(`🚫 #${d.signatureRequestId} annulée — le lien de signature ne fonctionne plus.${qui}\n\n${JSON.stringify(d)}`);
  } catch (e) { return err(e); }
});

// ── 7) Télécharger le document signé + preuve ────────────────────────────────
server.registerTool("paraf_download_signed", {
  title: "Télécharger le document signé",
  description: "Télécharge le PDF signé (avec certificat de preuve) une fois la signature complète. Écrit le fichier sur disque et renvoie son chemin + l'empreinte SHA-256. Erreur 409 tant que tout le monde n'a pas signé.",
  inputSchema: { id: z.number().int(), outPath: z.string().optional().describe("Chemin de sortie (défaut : ./paraf-<id>-signe.pdf)") },
  annotations: { readOnlyHint: true, openWorldHint: true },
}, async ({ id, outPath }) => {
  try {
    const r = await core.downloadSigned(cfg, { id });
    const dest = outPath || path.resolve(r.filename);
    fs.writeFileSync(dest, r.bytes);
    return txt(`✅ Document signé enregistré : ${dest}${r.hash ? `\nSHA-256 : ${r.hash}` : ""}`);
  } catch (e) { return err(e); }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[paraf-mcp] serveur prêt (stdio). baseUrl=" + cfg.baseUrl + " clé=" + (cfg.apiKey ? "OK" : "ABSENTE"));
