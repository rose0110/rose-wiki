/**
 * Serveur local avec les VRAIES variables Vertex du projet Vercel, puis sonde
 * des routes IA.
 *
 * Les valeurs viennent d'un fichier `.env` tire par `vercel env pull` (la
 * lecture par l'API Vercel renvoie des blobs chiffres pour les variables de
 * type `encrypted` : verifie le 11/09/2026, fail-closed de la passerelle
 * declenche). Le fichier est lu en memoire ; l'appelant le SUPPRIME juste apres.
 *
 * 1. lit GOOGLE_VERTEX_* dans SDP_VERTEX_ENV_FILE ;
 * 2. lance `next dev --webpack` sur un port local avec ces variables
 *    (VERCEL_ENV=development, VERCEL vide : compte de service, pas de jeton de test) ;
 * 3. joue `scripts/ia-europe/sonde-routes-ia.mjs` contre ce serveur ;
 * 4. arrete le serveur et ecrit la preuve (routes + traces [ai-gateway]).
 *
 * Usage :
 *   npx vercel env pull --environment=production --yes <fichier.env>
 *   SDP_VERTEX_ENV_FILE=<fichier.env> SDP_SONDE_STORAGE_STATE=<storageState> node scripts/ia-europe/serveur-local-vertex.mjs [port]
 *   rm <fichier.env>
 */
import { spawn, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const PORT = Number(process.argv[2] || 3013)
const envFile = process.env.SDP_VERTEX_ENV_FILE
if (!envFile || !process.env.SDP_SONDE_STORAGE_STATE) {
    console.error('SDP_VERTEX_ENV_FILE et SDP_SONDE_STORAGE_STATE requis.')
    process.exit(2)
}

function parseEnvFile(text) {
    const out = {}
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line || line.startsWith('#')) continue
        const eq = line.indexOf('=')
        if (eq < 0) continue
        const key = line.slice(0, eq).trim()
        let value = line.slice(eq + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }
        out[key] = value.replace(/\\n/g, '\n')
    }
    return out
}

const all = parseEnvFile(readFileSync(envFile, 'utf8'))
const vertex = {}
for (const key of ['GOOGLE_VERTEX_PROJECT', 'GOOGLE_VERTEX_CLIENT_EMAIL', 'GOOGLE_VERTEX_PRIVATE_KEY', 'GOOGLE_VERTEX_LOCATION']) {
    if (!all[key]) throw new Error(`variable absente dans le fichier : ${key}`)
    vertex[key] = all[key]
}
if (!/^europe-[a-z0-9]+$/.test(vertex.GOOGLE_VERTEX_LOCATION)) throw new Error('GOOGLE_VERTEX_LOCATION non europeenne ou mal lue')
// Cles PUBLIQUES du referentiel signe : sans elles, le chat et le controle de
// paie echouent avant tout appel IA (« PAYROLL_REFERENCE_PUBLIC_KEY_MISSING »).
// ⚠️ Les variables de type « sensitive » sortent de `vercel env pull` sous la
// forme litterale "[SENSITIVE]" : on ne les transmet pas (elles casseraient la
// route au lieu de l'aider). Chat et controle de paie ne sont alors prouvables
// qu'en production, ou la variable existe.
for (const key of ['PAYROLL_REFERENCE_SIGNING_PUBLIC_KEYS_JSON', 'PAYROLL_REFERENCE_UI_CHANNEL']) {
    if (all[key] && !/^\[SENSITIVE\]$/i.test(all[key])) vertex[key] = all[key]
    else if (all[key]) console.log(`Variable ${key} marquee sensible dans Vercel : non transmise (les routes qui lisent le referentiel signe ne sont prouvables qu'en production).`)
}
console.log(`Variables Vertex lues (region ${vertex.GOOGLE_VERTEX_LOCATION}, projet ${vertex.GOOGLE_VERTEX_PROJECT}).`)

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-p', String(PORT), '--webpack'], {
    cwd: process.cwd(),
    env: {
        ...process.env,
        ...vertex,
        VERCEL_ENV: 'development',
        VERCEL: '',
        AI_GATEWAY_TEST_ACCESS_TOKEN: '',
        // Diagnostic local : corps des erreurs 4xx/5xx du fournisseur (champ de requete fautif).
        AI_GATEWAY_DEBUG_ERRORS: process.env.AI_GATEWAY_DEBUG_ERRORS || '',
        ANTHROPIC_API_KEY: '', ANTHROPIC_KEY: '', OPENAI_API_KEY: '', PERPLEXITY_API_KEY: '', TAVILY_API_KEY: '',
        GOOGLE_API_KEY: '', GOOGLE_GENERATIVE_AI_API_KEY: '',
        TELEGRAM_BOT_TOKEN: '', RESEND_API_KEY: '',
        NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
})
let serverOut = ''
server.stdout.on('data', d => { serverOut += d })
server.stderr.on('data', d => { serverOut += d })

const BASE = `http://127.0.0.1:${PORT}`
for (let i = 0; i < 180; i++) {
    try {
        const r = await fetch(`${BASE}/api/version`, { signal: AbortSignal.timeout(2000) })
        if (r.status < 500) break
    } catch {
        // pas pret
    }
    await new Promise(r => setTimeout(r, 1000))
}

const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
const sondeOut = `docs/chantier/preuves/ia-en-europe/sonde-local-vertex-${stamp}.json`
// SDP_SONDE_SCRIPT permet de jouer une autre sonde (ex. sonde-post-deploiement.mjs) contre le serveur local.
const sonde = spawnSync(process.execPath, [process.env.SDP_SONDE_SCRIPT || 'scripts/ia-europe/sonde-routes-ia.mjs', sondeOut], {
    cwd: process.cwd(),
    env: { ...process.env, SDP_SONDE_BASE: BASE },
    encoding: 'utf8',
    timeout: 900_000,
})
console.log(sonde.stdout)
if (sonde.stderr) console.error(sonde.stderr.slice(0, 2000))
server.kill()
await new Promise(r => setTimeout(r, 1500))

// Journal complet du serveur (hors depot) pour le diagnostic, si demande.
if (process.env.SDP_SERVER_LOG) writeFileSync(process.env.SDP_SERVER_LOG, serverOut)
const traces = serverOut.split('\n').filter(l => l.includes('[ai-gateway]')).map(l => l.slice(l.indexOf('[ai-gateway]')).trim())
const refused = traces.filter(l => l.includes('refused'))
writeFileSync(`docs/chantier/preuves/ia-en-europe/traces-local-vertex-${stamp}.json`, JSON.stringify({ at: new Date().toISOString(), base: BASE, traces, refused }, null, 2))
console.log(`--- traces [ai-gateway] : ${traces.length} (refus : ${refused.length})`)
console.log(traces.join('\n'))
