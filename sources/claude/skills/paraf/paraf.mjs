#!/usr/bin/env node
/**
 * paraf.mjs — CLI de signature électronique Paraf (sans ouvrir l'interface).
 *
 * COUCHE MINCE : parsing d'arguments + affichage + I/O disque. TOUTE la logique
 * métier vit dans paraf-core.mjs (partagé avec le serveur MCP mcp-server.mjs) :
 * une seule source de vérité — un correctif profite au CLI ET au MCP.
 *
 * Commandes :
 *   send <pdf> [<pdf2> …] --signer "Nom|email|role" [...]   signature auto en bas + envoi
 *                                  (plusieurs PDF = une enveloppe : un seul e-mail et un
 *                                  seul lien par signataire, sans fusion des PDF)
 *   prepare-create <pdf> [<pdf2> …] --signer ...      brouillon (renvoie un token)
 *   detect <token> <pdf> [--document <id>] [--no-anchor|--no-ai|--anchor-only|--no-initials|--initials-skip-pages "7"|--mentions|--max-pages 12]
 *   preview <token> <pdf> --fields-file <json> [--document <id>] [--out apercu.pdf]
 *   save-fields <token> (--fields-file <json> | --fields-json '<json>') [--document <id>]
 *   send-prepared <token>
 *   remind <id> [--email "x@y.fr"]                    relance les signataires en attente
 *   cancel <id> [--reason "..."]                      annule : le lien ne signe plus
 *   status <id> | download <id> [out.pdf] [--document <id>] | config
 *
 * Options communes send/prepare-create : --title --message --type --ref --callback
 *   (enveloppe : --title = titre de l'enveloppe, --titles "T1|T2|…" = titre de chaque document)
 */
import fs from "node:fs";
import path from "node:path";
import * as core from "./paraf-core.mjs";

// ── Affichage / erreurs ─────────────────────────────────────────────────────
function out(obj) { console.log("\n" + JSON.stringify(obj)); }
function die(msg) { console.error("❌ " + msg); process.exit(1); }

// ── Parsing ─────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const o = { _: [], signer: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      if (key === "signer") o.signer.push(val);
      else o[key] = val;
    } else o._.push(a);
  }
  return o;
}
const str = (v) => (typeof v === "string" ? v : undefined); // ignore les flags booléens (--title sans valeur)
function parseSigner(s) {
  const [name, email, role, phone] = String(s).split(/[|;]/).map((x) => x.trim());
  if (!name || !email) throw new core.ParafError(`Signataire invalide : "${s}" (attendu "Nom|email|role").`);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new core.ParafError(`Email invalide pour "${name}" : ${email}`);
  // 4e champ facultatif : mobile (exigé par --sms, vérifié par le serveur).
  return { name, email, ...(role ? { role } : {}), ...(phone ? { phone } : {}) };
}
function loadPdf(p) {
  if (!p) throw new core.ParafError("Chemin du PDF manquant.");
  if (!fs.existsSync(p)) throw new core.ParafError(`Fichier introuvable : ${p}`);
  const buf = fs.readFileSync(p);
  core.assertPdf(buf);
  return buf;
}
function readFieldsArg(args) {
  let raw;
  if (typeof args["fields-file"] === "string") {
    if (!fs.existsSync(args["fields-file"])) throw new core.ParafError(`Fichier de champs introuvable : ${args["fields-file"]}`);
    raw = fs.readFileSync(args["fields-file"], "utf8");
  } else raw = args["fields-json"];
  if (!raw || raw === true) throw new core.ParafError("Fournis --fields-file <path.json> ou --fields-json '<json>'.");
  let fields;
  try { fields = JSON.parse(raw); } catch (e) { throw new core.ParafError(`JSON de champs invalide : ${e.message}`); }
  if (!Array.isArray(fields) || fields.length === 0) throw new core.ParafError("Le tableau de champs est vide.");
  return fields;
}
/** --cc "a@x.fr,b@x.fr" → destinataires en copie (max 5, ils ne signent pas). */
function ccOf(args) {
  return String(str(args.cc) || "").split(/[,;\s]+/).map(e => e.trim()).filter(Boolean).slice(0, 5);
}
function skipPagesOf(args) {
  return String(args["initials-skip-pages"] || "").split(/[,\s]+/).map(Number).filter(Boolean);
}

/**
 * Le ou les PDF de send / prepare-create. Un seul : la demande historique.
 * Plusieurs : une enveloppe (pas de fusion) ; --titles "T1|T2|…" titre chaque
 * document (sinon le nom du fichier), --title titre l'enveloppe.
 */
function docInputOf(args) {
  const pdfs = args._;
  if (pdfs.length === 0) throw new core.ParafError("Chemin du PDF manquant.");
  if (pdfs.length === 1) {
    return { pdfBuffer: loadPdf(pdfs[0]), fileName: path.basename(pdfs[0]), title: str(args.title), type: str(args.type) };
  }
  if (pdfs.length > 15) throw new core.ParafError("Une enveloppe contient au plus 15 documents.");
  const titles = String(str(args.titles) || "").split("|").map((t) => t.trim());
  return {
    title: str(args.title),
    documents: pdfs.map((p, i) => ({ pdfBuffer: loadPdf(p), fileName: path.basename(p), title: titles[i] || undefined, type: str(args.type) })),
  };
}
function printDocuments(d) {
  if (!Array.isArray(d.documents) || !d.documents.length) return;
  console.log(`📚 Enveloppe #${d.envelopeId} — ${d.documents.length} document(s) :`);
  for (const doc of d.documents) console.log(`   • ${doc.title} (${doc.pageCount} p.) → documentId ${doc.documentId}`);
}

// ═══════════════════════════ COMMANDES ════════════════════════════════════
async function cmdSend(cfg, args) {
  const docInput = docInputOf(args);
  if (args.signer.length === 0) throw new core.ParafError('Ajoute au moins un --signer "Nom|email|role".');
  const d = await core.createRequest(cfg, {
    ...docInput,
    signatories: args.signer.map(parseSigner), mode: "auto",
    message: str(args.message), externalRef: str(args.ref), callbackUrl: str(args.callback),
    ccEmails: ccOf(args), includeCertificate: args["no-certificate"] ? false : undefined,
    requireDrawnSignature: args["draw-only"] ? true : undefined,
    smsVerification: args.sms ? true : undefined,
  });
  console.log(`✅ Demande créée — id ${d.signatureRequestId}, statut ${d.status}`);
  printDocuments(d);
  console.log(d.documents ? "📧 Emails envoyés (un seul par signataire pour toute l'enveloppe). Liens directs :" : "📧 Emails envoyés. Liens directs :");
  for (const s of d.signatories || []) console.log(`   • ${s.name} <${s.email}>${s.signatureUrl ? `\n     ${s.signatureUrl}` : ""}`);
  if (d.webhookSecret) console.log(`🔐 webhookSecret : [MASQUÉ];
  out(d);
}

async function cmdPrepareCreate(cfg, args) {
  const docInput = docInputOf(args);
  if (args.signer.length === 0) throw new core.ParafError('Ajoute au moins un --signer "Nom|email|role".');
  const d = await core.createRequest(cfg, {
    ...docInput,
    signatories: args.signer.map(parseSigner), mode: "prepare",
    message: str(args.message), externalRef: str(args.ref), callbackUrl: str(args.callback),
    ccEmails: ccOf(args), includeCertificate: args["no-certificate"] ? false : undefined,
    requireDrawnSignature: args["draw-only"] ? true : undefined,
    smsVerification: args.sms ? true : undefined,
  });
  if (!d.token) throw new core.ParafError(`Pas de jeton de préparation dans la réponse : ${JSON.stringify(d)}`);
  console.log(`✅ Brouillon créé — id ${d.signatureRequestId} (mode préparation).`);
  console.log(`   token          : [MASQUÉ];
  console.log(`   preparationUrl : ${d.preparationUrl}`);
  printDocuments(d);
  if (d.documents) console.log("   Étape suivante : detect <token> <pdf> --document <id> pour CHAQUE document, puis send-prepared <token>.");
  out({
    signatureRequestId: d.signatureRequestId, token: [MASQUÉ], preparationUrl: d.preparationUrl, signatories: d.signatories,
    ...(d.documents ? { envelopeId: d.envelopeId, documents: d.documents } : {}),
  });
}

async function cmdDetect(cfg, args) {
  const token = [MASQUÉ];
  if (!token) throw new core.ParafError('Usage : detect <token> <pdf> [--no-anchor] [--no-ai] [--anchor-only] [--no-initials] [--initials-skip-pages "7"] [--mentions] [--max-pages 12]');
  const buf = loadPdf(args._[1]);
  const documentId = str(args.document);
  const r = await core.detectFields(cfg, {
    token, pdfBuffer: buf, documentId,
    maxPages: Number(args["max-pages"]) || 12,
    useAnchor: !args["no-anchor"], useAI: !args["no-ai"], anchorOnly: !!args["anchor-only"],
    mentions: !!args.mentions, noInitials: !!args["no-initials"], initialsSkipPages: skipPagesOf(args),
  });
  console.log(`📄 « ${r.document?.title} » — ${r.document?.pageCount} page(s), ${r.signatories.length} signataire(s).`);
  if (!r.fields.length) {
    console.log("⚠️  Aucun champ détecté. Place-les manuellement (save-fields) ou ouvre la preparationUrl.");
    return out({ fields: [], signatories: r.signatories });
  }
  const previewPath = path.join(path.dirname(args._[1]), `paraf-apercu-${token.slice(0, 8)}${documentId ? `-${documentId}` : ""}.pdf`);
  if (r.previewBytes) fs.writeFileSync(previewPath, r.previewBytes);
  console.log(`🔎 ${r.fields.length} champ(s) (${r.source.anchored} ancrés + ${r.source.ai} IA${r.source.textLayer ? "" : ", scan → IA"}) :`);
  for (const f of r.fields) {
    const sig = r.signatories.find((s) => s.id === f.signatoryId);
    console.log(`   • p.${f.page} ${f.type.padEnd(9)} ${sig ? sig.name : "?"}  (x${f.posX} y${f.posY} ${f.width}×${f.height})  ${f.label || ""}`);
  }
  console.log(`\n🖼️  Aperçu annoté : ${previewPath}`);
  if (documentId) console.log(`   Enregistrer : save-fields ${token} --document ${documentId} --fields-file <json>`);
  out({ ...(documentId ? { documentId: Number(documentId) } : {}), signatories: r.signatories, fields: r.fields, previewPath, source: r.source });
}

async function cmdPreview(cfg, args) {
  const token = [MASQUÉ];
  if (!token) throw new core.ParafError("Usage : preview <token> <pdf> --fields-file <json> [--out apercu.pdf]");
  const buf = loadPdf(args._[1]);
  const fields = readFieldsArg(args).map(core.normalizeField);
  const documentId = str(args.document);
  const info = await core.getPreparation(cfg, token, documentId);
  const outPath = str(args.out) || path.join(path.dirname(args._[1]), `paraf-apercu-${token.slice(0, 8)}${documentId ? `-${documentId}` : ""}.pdf`);
  const bytes = await core.annotate(buf, fields, info.signatories || []);
  fs.writeFileSync(outPath, bytes);
  console.log(`🖼️  Aperçu régénéré : ${outPath}`);
  out({ previewPath: outPath, count: fields.length });
}

async function cmdSaveFields(cfg, args) {
  const token = [MASQUÉ];
  if (!token) throw new core.ParafError("Usage : save-fields <token> (--fields-file <path.json> | --fields-json '<json>')");
  const documentId = str(args.document);
  const r = await core.saveFields(cfg, { token, fields: readFieldsArg(args), documentId });
  console.log(`✅ ${r.saved} champ(s) enregistré(s)${documentId ? ` sur le document ${documentId}` : ""} (relus en base : ${r.verified}).`);
  out(r);
}

async function cmdSendPrepared(cfg, args) {
  const token = [MASQUÉ];
  if (!token) throw new core.ParafError("Usage : send-prepared <token>");
  await core.sendPrepared(cfg, { token });
  console.log("✅ Document envoyé — emails d'invitation partis. Suis avec : status <id>.");
  out({ sent: true });
}

async function cmdStatus(cfg, args) {
  const id = args._[0];
  if (!id) throw new core.ParafError("Usage : status <id>");
  const d = await core.getStatus(cfg, { id });
  console.log(`📄 Demande #${d.signatureRequestId} — ${d.status}${d.documentReady ? "  (signé prêt ✅)" : ""}`);
  for (const s of d.signatories || []) console.log(`   • ${s.name} <${s.email}> : ${s.status}${s.signedAt ? ` (le ${s.signedAt})` : ""}`);
  if (Array.isArray(d.documents)) {
    console.log(`📚 Enveloppe #${d.envelopeId} :`);
    for (const doc of d.documents) console.log(`   • ${doc.title} (documentId ${doc.documentId}) : ${doc.status}${doc.documentReady ? " ✅" : ""}`);
  }
  out(d);
}

// Motifs renvoyés par l'API quand un signataire n'a pas été relancé.
const MOTIFS = {
  already_signed: "a déjà signé",
  too_soon: "relancé il y a moins d'une heure — réessayer plus tard",
  email_failed: "l'email n'est pas parti (vérifier Resend)",
};

async function cmdRemind(cfg, args) {
  const id = args._[0];
  if (!id) throw new core.ParafError('Usage : remind <id> [--email "x@y.fr"]');
  const d = await core.remindRequest(cfg, { id, email: str(args.email) });
  if (d.reminded?.length) {
    console.log(`📨 Relance envoyée à ${d.reminded.length} signataire(s) :`);
    for (const s of d.reminded) console.log(`   • ${s.name} <${s.email}> (relance n°${s.reminderNumber})`);
  } else {
    console.log("⚠️  Aucune relance envoyée.");
  }
  for (const s of d.skipped || []) console.log(`   – ${s.email} : ${MOTIFS[s.reason] || s.reason}`);
  out(d);
}

async function cmdCancel(cfg, args) {
  const id = args._[0];
  if (!id) throw new core.ParafError('Usage : cancel <id> [--reason "envoyée par erreur"]');
  const d = await core.cancelRequest(cfg, { id, reason: str(args.reason) });
  if (d.alreadyCancelled) {
    console.log(`ℹ️  Demande #${d.signatureRequestId} : déjà annulée, rien à faire.`);
  } else {
    console.log(`🚫 Demande #${d.signatureRequestId} annulée — le lien de signature ne fonctionne plus.`);
    const restants = d.cancelledSignatories || [];
    if (restants.length) {
      console.log(`   ${restants.length} signataire(s) n'avaient pas signé :`);
      for (const s of restants) console.log(`   • ${s.name} <${s.email}>`);
      console.log("   Pensez à les prévenir : ils ne recevront aucun email d'annulation.");
    }
  }
  out(d);
}

async function cmdDownload(cfg, args) {
  const id = args._[0];
  if (!id) throw new core.ParafError("Usage : download <id> [out.pdf] [--document <id>]");
  let documentId = str(args.document);
  if (!documentId) {
    // Enveloppe sans --document : un PDF signé par document, tous téléchargés.
    const st = await core.getStatus(cfg, { id });
    if (Array.isArray(st.documents) && st.documents.length > 1) {
      const dir = args._[1] || ".";
      fs.mkdirSync(dir, { recursive: true });
      for (const doc of st.documents) {
        const r = await core.downloadSigned(cfg, { id, documentId: doc.documentId });
        const slug = String(doc.title || "document").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "document";
        const outFile = path.join(dir, `paraf-${id}-${doc.documentId}-${slug}-signe.pdf`);
        fs.writeFileSync(outFile, r.bytes);
        console.log(`✅ ${doc.title} : ${path.resolve(outFile)}${r.hash ? `\n   SHA-256 : ${r.hash}` : ""}`);
      }
      return;
    }
    if (Array.isArray(st.documents) && st.documents.length === 1) documentId = String(st.documents[0].documentId);
  }
  const r = await core.downloadSigned(cfg, { id, documentId });
  const outFile = args._[1] || r.filename;
  fs.writeFileSync(outFile, r.bytes);
  console.log(`✅ Document signé : ${path.resolve(outFile)}`);
  if (r.hash) console.log(`   SHA-256 : ${r.hash}`);
}

function cmdConfig(cfg) {
  console.log(`baseUrl : ${cfg.baseUrl}`);
  console.log(`apiKey  : [MASQUÉ] ? cfg.apiKey.slice(0, 11) + "…" + cfg.apiKey.slice(-4) : "(aucune)"}`);
  console.log(`config  : ${cfg.cfgPath}`);
}

// ── Dispatch ───────────────────────────────────────────────────────────────
const HELP = "Commandes :\n" +
  '  send <pdf> [<pdf2> …] --signer "Nom|email|role"  (signature auto en bas + envoi)\n' +
  "  prepare-create <pdf> [<pdf2> …] --signer ...     (brouillon, renvoie un token)\n" +
  "  detect <token> <pdf> [--document <id>]           (ancrage texte + IA + aperçu)\n" +
  "  preview <token> <pdf> --fields-file <json>       (régénère l'aperçu après ajustement)\n" +
  "  save-fields <token> --fields-file <json> [--document <id>]  (enregistre les champs)\n" +
  "  send-prepared <token>                            (envoie les invitations)\n" +
  '  remind <id> [--email "x@y.fr"]                   (relance les signataires en attente)\n' +
  '  cancel <id> [--reason "envoyée par erreur"]      (annule : le lien ne signe plus)\n' +
  "  status <id> | download <id> [out.pdf|dossier] [--document <id>] | config\n\n" +
  "Plusieurs PDF à signer ensemble (enveloppe) : passer plusieurs fichiers à send /\n" +
  "prepare-create. Pas de fusion : chaque signataire reçoit UN e-mail et UN lien pour\n" +
  "tout signer (1 à 15 documents). --title = titre de l'enveloppe, --titles \"T1|T2|…\" =\n" +
  "titre de chaque document. En préparation : detect / preview / save-fields avec\n" +
  "--document <id> (ids affichés à la création), puis send-prepared une seule fois.\n" +
  "download <id> [dossier] télécharge alors un PDF signé par document.\n\n" +
  "Options de send / prepare-create :\n" +
  '  --cc "a@x.fr,b@x.fr"   destinataires en copie (max 5) : prévenus de l\'envoi et de\n' +
  "                         chaque signature, puis destinataires du PDF signé. Ne signent pas.\n" +
  "  --no-certificate       pas de page de certificat annexée au PDF signé (document\n" +
  "                         officiel dont la pagination doit rester intacte : CERFA…)\n" +
  "  --draw-only            signature TRACÉE À LA MAIN obligatoire : le parcours de\n" +
  "                         signature n'affiche que le canvas (ni modèle de police,\n" +
  "                         ni import d'image). Exigé par certains OPCO / CFA.\n" +
  '  --sms                  code SMS avant de signer (option payante, 0,10 € HT par\n' +
  '                         signataire) : mobile en 4e champ, --signer "Nom|email|role|06…".\n' +
  "                         L'expéditeur qui signe lui-même n'en a pas besoin.";

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const cfg = core.loadConfig();
  const args = parseArgs(rest);
  const table = {
    send: cmdSend, "prepare-create": cmdPrepareCreate, detect: cmdDetect, preview: cmdPreview,
    "save-fields": cmdSaveFields, "send-prepared": cmdSendPrepared, status: cmdStatus, download: cmdDownload,
    remind: cmdRemind, cancel: cmdCancel,
  };
  if (cmd === "config") return cmdConfig(cfg);
  const fn = table[cmd];
  if (!fn) { console.log(HELP); process.exit(cmd ? 1 : 0); }
  await fn(cfg, args);
}
main().catch((e) => die(e?.message || String(e)));
