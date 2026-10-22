/**
 * Garde reseau a l'execution — « IA en Europe ».
 *
 * Contrairement a l'analyse statique, ce test MESURE : il lance la passerelle
 * dans un processus enfant precharge par `garde-reseau-preload.cjs`, qui
 * intercepte DNS, TCP, TLS, HTTP et fetch avant emission, journalise chaque
 * cible et refuse tout hote hors liste blanche europeenne.
 *
 *  1. la passerelle exercee (Gemini texte, Claude, embeddings, synthese vocale,
 *     recherche ancree) ne vise QUE `europe-west1-aiplatform.googleapis.com` ;
 *  2. une sonde adverse qui tente de sortir par un autre chemin (fetch direct,
 *     SDK direct, Vertex US ou global, socket brut) est refusee AVANT emission ;
 *  3. les transports Node sont tous couverts (fetch, http, net, tls, http2, dns).
 *
 * Aucune credential reelle : les appels echouent cote fournisseur ; seule la
 * cible compte. Fonctionne hors ligne (la cible est journalisee avant le DNS).
 */

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const preload = resolve('tests/ia-europe/garde-reseau-preload.cjs')
const ALLOWED_HOST = /^europe-west1-aiplatform\.googleapis\.com$/

function runGuarded(args, { env = {}, timeout = 120_000 } = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'ia-europe-'))
    const logPath = join(dir, 'reseau.ndjson')
    const child = spawnSync(process.execPath, args, {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
            ...process.env,
            // Aucune cle de fournisseur ne doit fuiter dans l'enfant.
            ANTHROPIC_API_KEY: '', ANTHROPIC_KEY: '', OPENAI_API_KEY: '', PERPLEXITY_API_KEY: '', TAVILY_API_KEY: '',
            GOOGLE_API_KEY: '', GOOGLE_GENERATIVE_AI_API_KEY: '',
            IA_EUROPE_NETWORK_LOG: logPath,
            NODE_OPTIONS: `--require=${preload}`,
            ...env,
        },
        timeout,
        windowsHide: true,
    })
    let rows = []
    try {
        rows = readFileSync(logPath, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
    } catch {
        rows = []
    }
    rmSync(dir, { recursive: true, force: true })
    return { child, rows }
}

const isIp = host => /^\d{1,3}(\.\d{1,3}){3}$|^[0-9a-f:]+$/i.test(host)

test('la passerelle exercee ne contacte que le terminal Vertex europeen, pour chaque capacite', () => {
    const { child, rows } = runGuarded(['tests/ia-europe/probes/passerelle.mjs'])
    assert.equal(child.status, 0, `sonde passerelle\nstdout=${child.stdout}\nstderr=${child.stderr}`)
    assert.ok(rows.length > 0, 'le prechargeur doit avoir journalise des cibles')
    const refusedRows = rows.filter(r => !r.allowed)
    assert.deepEqual(refusedRows, [], 'aucune cible ne doit avoir ete refusee')
    const namedHosts = [...new Set(rows.map(r => r.host).filter(h => !isIp(h)))]
    assert.deepEqual(namedHosts, ['europe-west1-aiplatform.googleapis.com'], `hotes contactes : ${namedHosts.join(', ')}`)
    for (const host of namedHosts) assert.match(host, ALLOWED_HOST)
    // Les 5 capacites ont bien tente de sortir (fetch trace par le prechargeur).
    const fetches = rows.filter(r => r.transport === 'fetch')
    assert.ok(fetches.length >= 5, `au moins 5 emissions attendues (texte, Claude, embeddings, voix, recherche) : ${fetches.length}`)
    for (const name of ['gemini', 'claude', 'embedding', 'speech', 'recherche']) {
        assert.match(child.stdout, new RegExp(`\\[probe\\] ${name}:`), `capacite ${name} non exercee`)
    }
})

test('la passerelle en region Paris (europe-west9) reste europeenne', () => {
    const { child, rows } = runGuarded(['tests/ia-europe/probes/passerelle.mjs'], { env: { IA_EUROPE_PROBE_LOCATION: 'europe-west9' } })
    assert.equal(child.status, 0, child.stderr)
    const namedHosts = [...new Set(rows.map(r => r.host).filter(h => !isIp(h)))]
    assert.deepEqual(namedHosts, ['europe-west9-aiplatform.googleapis.com'])
})

test('une sonde adverse qui contourne la passerelle est refusee avant emission, sur chaque chemin', () => {
    const { child, rows } = runGuarded(['tests/ia-europe/probes/contournement.mjs'])
    assert.equal(child.status, 0, `contournement\nstdout=${child.stdout}\nstderr=${child.stderr}`)
    const refusedHosts = [...new Set(rows.filter(r => !r.allowed).map(r => r.host))].sort()
    assert.deepEqual(refusedHosts, [
        'aiplatform.googleapis.com',
        'api.anthropic.com',
        'api.openai.com',
        'api.perplexity.ai',
        'generativelanguage.googleapis.com',
        'us-central1-aiplatform.googleapis.com',
    ])
    assert.deepEqual(rows.filter(r => r.allowed), [], 'aucune emission autorisee dans une sonde adverse')
    assert.match(child.stdout, /passerelle us-central1: refuse/)
})

test('le prechargeur couvre tous les transports Node avant emission', () => {
    const probes = {
        fetch: `fetch('https://api.openai.com/v1/models').then(()=>process.exit(2)).catch(e=>process.exit(e.code==='IA_EUROPE_HOST_REFUSED'?0:3))`,
        https: `try{require('node:https').get('https://api.anthropic.com/v1/messages');process.exit(2)}catch(e){process.exit(e.code==='IA_EUROPE_HOST_REFUSED'?0:3)}`,
        http: `try{require('node:http').get('http://api.perplexity.ai/');process.exit(2)}catch(e){process.exit(e.code==='IA_EUROPE_HOST_REFUSED'?0:3)}`,
        socket: `try{new (require('node:net').Socket)().connect(443,'generativelanguage.googleapis.com');process.exit(2)}catch(e){process.exit(e.code==='IA_EUROPE_HOST_REFUSED'?0:3)}`,
        tls: `try{require('node:tls').connect(443,'api.openai.com');process.exit(2)}catch(e){process.exit(e.code==='IA_EUROPE_HOST_REFUSED'?0:3)}`,
        http2: `try{require('node:http2').connect('https://api.anthropic.com');process.exit(2)}catch(e){process.exit(e.code==='IA_EUROPE_HOST_REFUSED'?0:3)}`,
        dns: `try{require('node:dns').lookup('api.openai.com',()=>{});process.exit(2)}catch(e){process.exit(e.code==='IA_EUROPE_HOST_REFUSED'?0:3)}`,
        dnsPromises: `require('node:dns').promises.lookup('api.openai.com').then(()=>process.exit(2)).catch(e=>process.exit(e.code==='IA_EUROPE_HOST_REFUSED'?0:3))`,
        undici: `require('undici').request('https://api.openai.com/v1/models').then(()=>process.exit(2)).catch(e=>process.exit((e.code==='IA_EUROPE_HOST_REFUSED'||String(e.cause&&e.cause.code)==='IA_EUROPE_HOST_REFUSED')?0:3))`,
    }
    for (const [name, source] of Object.entries(probes)) {
        const { child } = runGuarded(['-e', source], { timeout: 20_000 })
        assert.equal(child.status, 0, `${name}\nstdout=${child.stdout}\nstderr=${child.stderr}`)
    }
})

test('un hote europeen est autorise et journalise comme tel', () => {
    const { child, rows } = runGuarded(['-e', `try{require('node:dns').lookup('europe-west1-aiplatform.googleapis.com',()=>process.exit(0));}catch(e){process.exit(3)}`], { timeout: 20_000 })
    assert.equal(child.status, 0, child.stderr)
    assert.deepEqual(rows.map(r => [r.host, r.allowed]), [['europe-west1-aiplatform.googleapis.com', true]])
})
