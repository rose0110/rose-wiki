/**
 * Garde reseau de bout en bout — « IA en Europe ».
 *
 * Lance le serveur Next DEJA CONSTRUIT (`next build`) sous le prechargeur
 * `tests/ia-europe/garde-reseau-preload.cjs`, avec une configuration Vertex de
 * test et un jeton de test (AI_GATEWAY_TEST_ACCESS_TOKEN, ignore en production),
 * puis joue les VRAIES routes IA avec la session d'un compte de test. Chaque
 * cible reseau du serveur est journalisee ; toute cible hors liste blanche
 * europeenne fait echouer l'appel avant emission.
 *
 * Ce que ca mesure : les routes IA, telles que servies, ne contactent que
 * `europe-<region>-aiplatform.googleapis.com` (plus l'authentification Supabase,
 * hors IA). Les appels echouent cote Google (jeton de test) : c'est la cible qui
 * compte, pas la reponse.
 *
 * Usage (apres `next build`) :
 *   SDP_SONDE_STORAGE_STATE=<storageState Playwright> node scripts/ia-europe/garde-reseau-serveur.mjs [port]
 * Sortie : docs/chantier/preuves/ia-en-europe/garde-reseau-serveur-<date>.json
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const PORT = Number(process.argv[2] || 3012)
// `start` exige un `next build` prealable (Turbopack, comme sur Vercel). En
// local, sur un worktree dont node_modules est une jonction, Turbopack refuse
// de construire : SDP_GARDE_MODE=dev lance `next dev --webpack`, qui compile
// les routes a la demande. La mesure (cibles reseau du serveur) est identique.
const MODE = process.env.SDP_GARDE_MODE === 'dev' ? 'dev' : 'start'
const NEXT_ARGS = MODE === 'dev' ? ['dev', '-p', String(PORT), '--webpack'] : ['start', '-p', String(PORT)]
const STATE = process.env.SDP_SONDE_STORAGE_STATE
if (!STATE) {
    console.error('SDP_SONDE_STORAGE_STATE requis.')
    process.exit(2)
}
const state = JSON.parse(readFileSync(STATE, 'utf8'))
const cookie = state.cookies.map(c => `${c.name}=${c.value}`).join('; ')
const HEADERS = { 'Content-Type': 'application/json', Cookie: cookie }
const BASE = `http://127.0.0.1:${PORT}`
const logPath = join(mkdtempSync(join(tmpdir(), 'ia-europe-serveur-')), 'reseau.ndjson')
const preload = resolve('tests/ia-europe/garde-reseau-preload.cjs')

// Liste blanche du serveur : inference Vertex UE + authentification Google +
// Supabase (session, base) — rien d'autre. Le serveur local n'envoie ni mail ni
// Telegram dans ce parcours (variables vidées ci-dessous).
const allowedHosts = [
    '^europe-[a-z0-9]+-aiplatform\\.googleapis\\.com$',
    '^oauth2\\.googleapis\\.com$',
    '^[a-z0-9-]+\\.supabase\\.co$',
    '^[a-z0-9-]+\\.pooler\\.supabase\\.com$',
    // next/font telecharge les polices a la compilation (mode dev) — hors IA.
    '^fonts\\.googleapis\\.com$',
    '^fonts\\.gstatic\\.com$',
    // Infrastructure existante, hors IA : rapport d'erreurs Sentry (Allemagne,
    // sous-traitant declare) et verification de version de Next en mode dev.
    '^[a-z0-9]+\\.ingest\\.de\\.sentry\\.io$',
    '^registry\\.npmjs\\.org$',
].join(',')

const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', ...NEXT_ARGS], {
    cwd: process.cwd(),
    env: {
        ...process.env,
        NODE_OPTIONS: `--require=${preload}`,
        IA_EUROPE_NETWORK_LOG: logPath,
        IA_EUROPE_ALLOWED_HOSTS: allowedHosts,
        VERCEL_ENV: 'development',
        VERCEL: '', // hors Vercel : le jeton de test est honore (il est ignore sur Vercel)
        GOOGLE_VERTEX_PROJECT: 'sdp-garde-reseau',
        GOOGLE_VERTEX_CLIENT_EMAIL: 'svc@sdp-garde-reseau.iam.gserviceaccount.com',
        GOOGLE_VERTEX_PRIVATE_KEY: ['cle-de-test', 'ligne-2'].join('\\n'),
        GOOGLE_VERTEX_LOCATION: 'europe-west1',
        AI_GATEWAY_TEST_ACCESS_TOKEN: ['jeton', 'de', 'test'].join('-'),
        // Aucune cle de fournisseur, aucun canal sortant annexe.
        ANTHROPIC_API_KEY: '', ANTHROPIC_KEY: '', OPENAI_API_KEY: '', PERPLEXITY_API_KEY: '', TAVILY_API_KEY: '',
        GOOGLE_API_KEY: '', GOOGLE_GENERATIVE_AI_API_KEY: '',
        TELEGRAM_BOT_TOKEN: '', RESEND_API_KEY: '', SENTRY_DSN: '', NEXT_PUBLIC_SENTRY_DSN: '',
        NEXT_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
})
let serverOut = ''
server.stdout.on('data', d => { serverOut += d })
server.stderr.on('data', d => { serverOut += d })

async function waitForServer() {
    for (let i = 0; i < 180; i++) {
        try {
            const res = await fetch(`${BASE}/api/version`, { signal: AbortSignal.timeout(2000) })
            if (res.status < 500) return
        } catch {
            // pas encore pret
        }
        await new Promise(r => setTimeout(r, 1000))
    }
    throw new Error(`serveur non pret sur ${BASE}\n${serverOut.slice(-2000)}`)
}

const rows = []
async function call(name, path, body, method = 'POST') {
    const started = Date.now()
    try {
        const res = await fetch(BASE + path, { method, headers: HEADERS, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60_000) })
        const text = await res.text()
        rows.push({ name, path, status: res.status, ms: Date.now() - started, excerpt: text.slice(0, 200) })
    } catch (error) {
        rows.push({ name, path, status: 'ERR', ms: Date.now() - started, excerpt: error.message })
    }
}

let exitCode = 0
try {
    await waitForServer()
    await call('text-to-speech', '/api/text-to-speech', { text: 'Bonjour, test de garde reseau.' })
    await call('generate-resume', '/api/generate-resume', { text: 'Le SMIC est revalorise chaque annee au 1er janvier.' })
    await call('chat', '/api/chat', { messages: [{ id: 'g1', role: 'user', parts: [{ type: 'text', text: 'Reponds en une phrase : duree legale du travail ?' }] }] })
    let sessionId = null
    try {
        const res = await fetch(`${BASE}/api/agent/sessions`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ title: 'Garde reseau IA Europe' }), signal: AbortSignal.timeout(60_000) })
        const text = await res.text()
        try {
            const json = JSON.parse(text)
            sessionId = json?.session?.id || json?.id || null
        } catch {
            sessionId = null
        }
        rows.push({ name: 'agent-session', path: '/api/agent/sessions', status: res.status, excerpt: sessionId ? 'session creee' : text.slice(0, 200) })
    } catch (error) {
        rows.push({ name: 'agent-session', path: '/api/agent/sessions', status: 'ERR', excerpt: error.message })
    }
    if (sessionId) {
        await call('agent-events', '/api/agent/events', { sessionId, messages: [{ id: 'g2', role: 'user', parts: [{ type: 'text', text: 'Reponds en une phrase : conges payes par mois ?' }] }] })
        await call('agent-events-claude', '/api/agent/events', { sessionId, model: 'claude', messages: [{ id: 'g3', role: 'user', parts: [{ type: 'text', text: 'Reponds en une phrase : conges payes par mois ?' }] }] })
    } else {
        rows.push({ name: 'agent-events', status: 'SKIP', excerpt: 'pas de session' })
    }
    await call('controles-executer', '/api/controles/executer', {
        controleIds: ['controle-fillon'],
        source: 'BULLETIN DE PAIE (exemple synthetique) - Periode : 01/2026\nSalaire de base : 2 000,00\nBrut : 2 000,00\nSMIC horaire : 11,88\nHeures : 151,67\nReduction generale : 0,00',
    })
    await call('conges-report', '/api/conges-report/calculer', {
        typeArret: 'non_professionnel', dateDebut: '2025-03-01', dateFin: '2025-06-30', dateReprise: '2025-07-01', dateInformation: '2025-07-10',
        cpNonPris: 5, empeche: true, joursAcquisParPeriode: [{ dateDebut: '2024-06-01', dateFin: '2025-05-31', joursAcquis: 25 }],
    })
} catch (error) {
    rows.push({ name: 'serveur', status: 'ERR', excerpt: error.message })
    exitCode = 3
} finally {
    server.kill()
}

let network = []
try {
    network = readFileSync(logPath, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
} catch {
    network = []
}
const isIp = h => /^\d{1,3}(\.\d{1,3}){3}$|^[0-9a-f:]+$/i.test(h)
const namedHosts = [...new Set(network.map(r => r.host).filter(h => h && !isIp(h) && !/^(localhost|127\.0\.0\.1|::1|0\.0\.0\.0)$/.test(h)))].sort()
const refused = network.filter(r => !r.allowed)
const aiHosts = namedHosts.filter(h => /aiplatform|googleapis/.test(h))
const verdict = {
    at: new Date().toISOString(),
    base: BASE,
    routes: rows,
    hotesContactes: namedHosts,
    hotesIA: aiHosts,
    refuses: refused,
    cibles: network.length,
    verdict:
        refused.length === 0 && aiHosts.length > 0 && aiHosts.every(h => /^europe-[a-z0-9]+-aiplatform\.googleapis\.com$/.test(h))
            ? 'OK : seules des cibles europeennes pour l IA, aucun refus'
            : 'KO',
    traces: serverOut.split('\n').filter(l => l.includes('[ai-gateway]')).slice(0, 40),
}
const out = `docs/chantier/preuves/ia-en-europe/garde-reseau-serveur-${verdict.at.slice(0, 19).replace(/[:T]/g, '-')}.json`
writeFileSync(out, JSON.stringify(verdict, null, 2))
console.log(JSON.stringify({ verdict: verdict.verdict, hotesIA: aiHosts, refuses: refused.length, routes: rows.map(r => `${r.name}:${r.status}`) }, null, 2))
console.log(`--- ecrit ${out}`)
process.exit(exitCode || (verdict.verdict.startsWith('OK') ? 0 : 1))
