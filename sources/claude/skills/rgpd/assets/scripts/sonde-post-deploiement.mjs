/**
 * Sonde complementaire APRES mise en ligne — plan § 6 de
 * docs/chantier/preuves/ia-en-europe/verdicts.md (verdicts testeur-qa + expert-paie) :
 *   3. Agent Paie : « cout employeur pour 2 800 € brut » → l'outil recoit { brut: 2800 } typé nombre ;
 *   4. Agent Paie en mode Claude explicite → reponse produite (Claude Sonnet 4.5 via Vertex) ;
 *   5. Chat : question qui appelle la recherche web → l'outil renvoie des sources ;
 *   6. Agent Paie : maintien CONVENTIONNEL sans IDCC → refus en une phrase, aucun code technique a l'ecran ;
 *   7. Controle de paie : bulletin de reference 2 000 € / 151,67 h / effectif 30 → RGDU coefficient 0,3147,
 *      attendu 629,40 € ; variante effectif 120 → 0,3178 / 635,60 € ; ligne a 500 € → « attention ».
 *
 * Donnees 100 % synthetiques, compte de test. Aucune creation durable hors la session d'agent
 * (comme la sonde principale). N'ecrit que des extraits courts.
 *
 * Usage : SDP_SONDE_STORAGE_STATE=<storageState> SDP_SONDE_BASE=https://www.smartdatapay.app \
 *         node scripts/ia-europe/sonde-post-deploiement.mjs [sortie.json]
 */
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = (process.env.SDP_SONDE_BASE || 'https://www.smartdatapay.app').replace(/\/$/, '')
const OUT = process.argv[2] || `docs/chantier/preuves/ia-en-europe/sonde-post-deploiement-${new Date().toISOString().slice(0, 10)}.json`
if (!process.env.SDP_SONDE_STORAGE_STATE) {
    console.error('SDP_SONDE_STORAGE_STATE requis (storageState Playwright du compte de test).')
    process.exit(2)
}
const state = JSON.parse(readFileSync(process.env.SDP_SONDE_STORAGE_STATE, 'utf8'))
const cookie = state.cookies.map(c => `${c.name}=${c.value}`).join('; ')
const HEADERS = { 'Content-Type': 'application/json', Cookie: cookie, 'User-Agent': 'sdp-ia-europe-sonde-post/1' }
const rows = []
const JARGON = /\bC0\d_|\bC1\d_|CCN_[A-Z_]+|AI_[A-Za-z]+Error|fail-closed|déterministe|deterministe|canonique|résolveur|runtime|périmètre protégé|perimetre protege/i

function note(row) {
    rows.push(row)
    console.log(JSON.stringify(row))
}

async function post(path, body, timeoutMs = 170_000) {
    const started = Date.now()
    const res = await fetch(BASE + path, { method: 'POST', headers: HEADERS, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs) })
    return { res, text: await res.text(), ms: Date.now() - started }
}

/** Analyse un flux UI-message : texte, appels et sorties d'outils, erreurs. */
function lireFlux(text) {
    const parts = []
    for (const line of text.split('\n')) {
        try { parts.push(JSON.parse(line.replace(/^data: ?/, ''))) } catch { /* ligne non JSON */ }
    }
    const texte = parts.filter(p => p.type === 'text-delta').map(p => p.delta || '').join('')
    const outils = parts.filter(p => p.type === 'tool-input-available').map(p => ({ toolName: p.toolName, input: p.input }))
    const sorties = parts.filter(p => p.type === 'tool-output-available').map(p => p.output)
    const erreurs = parts.filter(p => p.type === 'error' || p.type === 'tool-error').map(p => JSON.stringify(p).slice(0, 200))
    return { texte, outils, sorties, erreurs, types: [...new Set(parts.map(p => p.type))] }
}

// --- Session d'agent (comme la sonde principale)
let sessionId = null
try {
    const { res, text } = await post('/api/agent/sessions', { title: 'Sonde IA Europe — post-deploiement' })
    sessionId = JSON.parse(text)?.session?.id || JSON.parse(text)?.id || null
    note({ name: 'agent-session', status: res.status, excerpt: sessionId ? 'session creee' : text.slice(0, 200) })
} catch (error) {
    note({ name: 'agent-session', status: 'ERR', excerpt: error.message })
}

async function agent(name, texte, extra = {}, verif) {
    if (!sessionId) return note({ name, status: 'SKIP', excerpt: 'pas de sessionId' })
    try {
        const { res, text, ms } = await post('/api/agent/events', {
            sessionId,
            ...extra,
            messages: [{ id: `post-${name}`, role: 'user', parts: [{ type: 'text', text: texte }] }],
        })
        const flux = lireFlux(text)
        const row = { name, status: res.status, ms, outils: flux.outils.slice(0, 4), erreurs: flux.erreurs, texte: flux.texte.slice(0, 300), jargon: JARGON.test(flux.texte) ? flux.texte.match(JARGON)[0] : null }
        if (verif) row.verdict = verif(flux, row)
        note(row)
    } catch (error) {
        note({ name, status: 'ERR', excerpt: error.message })
    }
}

// 3. Outil de calcul avec argument typé nombre
await agent('agent-cout-employeur-2800', 'Quel est le coût employeur mensuel pour un salarié non-cadre à 2 800 € brut ? Utilise ton outil de calcul.', {}, flux => {
    const appel = flux.outils.find(o => /coutEmployeur|BrutNet/i.test(o.toolName))
    return appel ? (typeof appel.input?.brut === 'number' ? `OK outil ${appel.toolName} appelé avec brut=${appel.input.brut} (nombre)` : `KO brut non numérique : ${JSON.stringify(appel.input)}`) : 'KO aucun outil de calcul appelé'
})

// 6. Maintien conventionnel sans IDCC : refus utile, aucun code technique
await agent('agent-maintien-conventionnel-sans-idcc', "Calcule le maintien de salaire conventionnel pour un arrêt maladie du 2 au 16 mars 2026, salaire 2 500 € brut, embauche le 1er février 2020. Je ne connais pas la convention collective, calcule quand même en mode conventionnel.", {}, (flux, row) => {
    if (row.jargon) return `KO vocabulaire technique visible : ${row.jargon}`
    return flux.erreurs.length ? `à lire : ${flux.erreurs.length} part(s) d'erreur d'outil (non affichées telles quelles ?)` : 'OK aucun code technique dans le texte'
})

// 4. Claude explicite via Vertex
await agent('agent-claude-explicite', 'Réponds en une phrase : à quelle date le SMIC est-il revalorisé chaque année ?', { model: 'claude' }, flux => (flux.texte.length > 10 && flux.erreurs.length === 0 ? 'OK réponse produite' : 'KO'))

// 5. Chat + recherche web
try {
    const { res, text, ms } = await post('/api/chat', {
        messages: [{ id: 'post-chat-web', role: 'user', parts: [{ type: 'text', text: 'Cherche sur le web le montant du SMIC horaire brut en vigueur en 2026 et cite tes sources (URL).' }] }],
    })
    const flux = lireFlux(text)
    const sortieWeb = flux.sorties.find(s => s && typeof s === 'object' && Array.isArray(s.results))
    note({
        name: 'chat-recherche-web', status: res.status, ms,
        outils: flux.outils.map(o => o.toolName).slice(0, 5),
        sources: sortieWeb ? sortieWeb.results.length : null,
        hotes: sortieWeb ? [...new Set(sortieWeb.results.map(r => { try { return new URL(r.url).hostname } catch { return '?' } }))].slice(0, 5) : [],
        erreurs: flux.erreurs, texte: flux.texte.slice(0, 200),
        verdict: !flux.outils.some(o => o.toolName === 'webSearch') ? 'à lire : outil webSearch non appelé (le modèle a répondu sans chercher)' : sortieWeb && sortieWeb.results.length > 0 ? `OK ${sortieWeb.results.length} source(s)` : 'KO recherche appelée sans source',
    })
} catch (error) {
    note({ name: 'chat-recherche-web', status: 'ERR', excerpt: error.message })
}

// 7. Contrôle de paie — bulletin de référence (expert-paie) : 2 000 € / 151,67 h / effectif 30
function bulletin(ligneRgdu) {
    return [
        'BULLETIN DE PAIE (exemple synthetique) - Periode : 01/2026',
        'Statut : non-cadre — Effectif de l entreprise : {EFFECTIF} salaries',
        'Salaire de base : 2 000,00 (151,67 h)',
        'Brut : 2 000,00',
        'Total cotisations salariales : 440,00',
        'Cotisations patronales : 840,00',
        `Reduction generale des cotisations patronales : -${ligneRgdu}`,
        'Net a payer avant impot : 1 560,00',
    ].join('\n')
}
async function controle(name, effectif, ligne, attenduCoef, attenduMontant, attenduStatut) {
    try {
        const { res, text, ms } = await post('/api/controles/executer', {
            controleIds: ['controle-fillon'],
            effectif,
            source: bulletin(ligne).replace('{EFFECTIF}', String(effectif)),
        })
        let j = null
        try { j = JSON.parse(text) } catch { /* pas du JSON */ }
        const lignes = (j?.controles || []).map(c => ({ point: c.point, status: c.status, attendu: c.attendu, bulletin: c.bulletin, detail: String(c.detail || '').slice(0, 220) }))
        const rgdu = lignes.find(l => /Montant mensuel|coefficient/i.test(l.point + ' ' + l.detail))
        const coef = rgdu ? (String(rgdu.detail).match(/[Cc]oefficient (\d[.,]\d{4})/) || [])[1] : null
        const verdict = !rgdu ? `KO aucune ligne RGDU (${lignes.map(l => l.point).join(' | ') || text.slice(0, 160)})`
            : (coef && coef.replace(',', '.') === attenduCoef && rgdu.status === attenduStatut) ? `OK coefficient ${coef}, statut ${rgdu.status}, attendu ${rgdu.attendu}`
                : `KO coefficient ${coef} (attendu ${attenduCoef}), statut ${rgdu.status} (attendu ${attenduStatut}), attendu ${rgdu.attendu} (attendu ${attenduMontant})`
        note({ name, status: res.status, ms, effectif, ligne, lignes: lignes.slice(0, 6), verdict })
    } catch (error) {
        note({ name, status: 'ERR', excerpt: error.message })
    }
}
await controle('controle-rgdu-reference-eff30', 30, '629,40', '0.3147', 629.4, 'ok')
await controle('controle-rgdu-eff120', 120, '635,60', '0.3178', 635.6, 'ok')
await controle('controle-rgdu-ecart-500', 30, '500,00', '0.3147', 629.4, 'attention')

writeFileSync(OUT, JSON.stringify({ base: BASE, at: new Date().toISOString(), rows }, null, 2))
console.log(`--- ecrit ${OUT}`)
const ko = rows.filter(r => String(r.verdict || '').startsWith('KO') || r.status === 'ERR' || (typeof r.status === 'number' && r.status >= 400))
process.exit(ko.length ? 1 : 0)
