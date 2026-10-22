/**
 * Sonde des routes IA d'un deploiement (production ou Preview) — chantier
 * « IA en Europe ».
 *
 * Joue, avec la session d'un compte de test, chaque route IA du produit avec
 * des donnees 100 % synthetiques (aucune personne reelle), et ecrit un JSON
 * brut : statut HTTP, duree, extrait de reponse (sans donnee personnelle).
 * Sert deux fois : la reference AVANT changement, et la preuve APRES.
 *
 * Usage :
 *   SDP_SONDE_STORAGE_STATE=<storageState Playwright> \
 *   SDP_SONDE_BASE=https://www.smartdatapay.app \
 *   node scripts/ia-europe/sonde-routes-ia.mjs [fichier-sortie.json]
 *
 * Le storageState est celui du runner test-app (compte e2e-tests@…). Il
 * n'est jamais ecrit dans la sortie.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = process.env.SDP_SONDE_BASE || 'https://www.smartdatapay.app'
const STATE = process.env.SDP_SONDE_STORAGE_STATE
if (!STATE) {
    console.error('SDP_SONDE_STORAGE_STATE requis (storageState Playwright du compte de test).')
    process.exit(2)
}
const OUT = process.argv[2] || `docs/chantier/preuves/ia-en-europe/sonde-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
const state = JSON.parse(readFileSync(STATE, 'utf8'))
const cookie = state.cookies.map(c => `${c.name}=${c.value}`).join('; ')
const HEADERS = { 'Content-Type': 'application/json', Cookie: cookie, 'User-Agent': 'sdp-ia-europe-sonde/1' }
const rows = []

async function probe(name, path, body, { method = 'POST', extract, timeoutMs = 170_000 } = {}) {
    const started = Date.now()
    try {
        const res = await fetch(BASE + path, {
            method,
            headers: HEADERS,
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(timeoutMs),
        })
        const contentType = res.headers.get('content-type') || ''
        let excerpt
        if (contentType.startsWith('audio/')) {
            const buf = await res.arrayBuffer()
            excerpt = `audio ${contentType} ${buf.byteLength} octets`
        } else {
            const text = await res.text()
            // Extrait court : ce fichier est versionne. A n'utiliser qu'avec le
            // compte de test et des donnees synthetiques (verdict securite-rgpd).
            excerpt = extract ? extract(text) : text.slice(0, 160)
        }
        const row = {
            name,
            path,
            status: res.status,
            ms: Date.now() - started,
            contentType,
            excerpt,
            headers: Object.fromEntries([...res.headers].filter(([k]) => /^x-|^server$|^cache-control$/.test(k))),
        }
        rows.push(row)
        console.log(JSON.stringify(row))
        return row
    } catch (error) {
        const row = { name, path, status: 'ERR', ms: Date.now() - started, excerpt: error.message }
        rows.push(row)
        console.log(JSON.stringify(row))
        return row
    }
}

/** Flux UI-message du AI SDK : types de parts, debut du texte, erreurs, metadonnees. */
const streamExcerpt = text => {
    const lines = text.split('\n').filter(Boolean)
    const types = new Set()
    let txt = ''
    let meta = ''
    for (const line of lines) {
        try {
            const j = JSON.parse(line.replace(/^data: ?/, ''))
            types.add(j.type)
            if (j.type === 'text-delta') txt += j.delta || ''
            if (j.type === 'error') meta += ` ERROR:${JSON.stringify(j).slice(0, 200)}`
            if (j.messageMetadata) meta += ` META:${JSON.stringify(j.messageMetadata).slice(0, 200)}`
        } catch {
            // ligne non JSON (ex. "[DONE]")
        }
    }
    return `lines=${lines.length} types=[${[...types].join(',')}] text="${txt.slice(0, 200)}"${meta}`
}

const maskEmail = t => t.replace(/"email":"[^"]+"/g, '"email":"<masque>"')

// 1. Session
await probe('session', '/api/user/me', null, { method: 'GET', extract: t => maskEmail(t).slice(0, 200) })
// 2. Synthese vocale
await probe('text-to-speech', '/api/text-to-speech', { text: 'Bonjour, ceci est un test de synthese vocale.' })
// 3. Resume de texte
await probe('generate-resume', '/api/generate-resume', {
    text: 'Le salaire minimum de croissance est revalorise chaque annee au 1er janvier. Il sert de plancher a toute remuneration.',
})
// 4. Chat
await probe(
    'chat',
    '/api/chat',
    { messages: [{ id: 'sonde-1', role: 'user', parts: [{ type: 'text', text: 'Reponds en une phrase : quelle est la duree legale hebdomadaire du travail en France ?' }] }] },
    { extract: streamExcerpt }
)
// 5. Agent Paie (session + evenement)
let sessionId = null
try {
    const res = await fetch(`${BASE}/api/agent/sessions`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ title: 'Sonde IA Europe' }) })
    const json = await res.json()
    sessionId = json?.id || json?.session?.id || null
    rows.push({ name: 'agent-session', path: '/api/agent/sessions', status: res.status, excerpt: sessionId ? 'session creee' : JSON.stringify(json).slice(0, 200) })
} catch (error) {
    rows.push({ name: 'agent-session', path: '/api/agent/sessions', status: 'ERR', excerpt: error.message })
}
if (sessionId) {
    await probe(
        'agent-events',
        '/api/agent/events',
        { sessionId, messages: [{ id: 'sonde-2', role: 'user', parts: [{ type: 'text', text: 'Reponds en une phrase : combien de jours ouvrables de conges payes acquiert-on par mois de travail effectif ?' }] }] },
        { extract: streamExcerpt }
    )
    // 5b. Recherche dans les documents du projet : outil de l'agent (embedding de la requete)
    await probe(
        'agent-events-recherche-documents',
        '/api/agent/events',
        { sessionId, messages: [{ id: 'sonde-3', role: 'user', parts: [{ type: 'text', text: 'Cherche dans les documents du projet le mot « sonde » et dis-moi en une phrase ce que tu trouves.' }] }] },
        { extract: streamExcerpt }
    )
} else {
    rows.push({ name: 'agent-events', status: 'SKIP', excerpt: 'pas de sessionId' })
}
// 6. Controle de paie (bulletin synthetique, aucune personne reelle)
await probe(
    'controles-executer',
    '/api/controles/executer',
    {
        controleIds: ['controle-fillon'],
        source: 'BULLETIN DE PAIE (exemple synthetique) - Periode : 01/2026\nSalaire de base : 2 000,00\nBrut : 2 000,00\nSMIC horaire : 11,88\nHeures : 151,67\nReduction generale : 0,00\nNet a payer : 1 560,00',
    },
    { extract: t => t.slice(0, 500) }
)
// 7. Report de conges apres arret maladie
await probe(
    'conges-report',
    '/api/conges-report/calculer',
    {
        typeArret: 'non_professionnel',
        dateDebut: '2025-03-01',
        dateFin: '2025-06-30',
        dateReprise: '2025-07-01',
        dateInformation: '2025-07-10',
        cpNonPris: 5,
        empeche: true,
        joursAcquisParPeriode: [{ dateDebut: '2024-06-01', dateFin: '2025-05-31', joursAcquis: 25 }],
    },
    { extract: t => t.slice(0, 300) }
)

writeFileSync(OUT, JSON.stringify({ base: BASE, at: new Date().toISOString(), rows }, null, 2))
console.log(`--- ecrit ${OUT}`)
