/**
 * Passerelle IA europeenne — comportement sans reseau.
 *
 *  - refuse de demarrer si les variables Vertex manquent (production comprise),
 *    au lieu de retomber sur un terminal americain ;
 *  - chaque terminal construit a un hote `<region-ue>-aiplatform.googleapis.com`
 *    (texte Gemini, Claude sur Vertex, embeddings, synthese vocale) ;
 *  - le transport refuse tout hote hors Europe AVANT d'emettre (fail-closed) ;
 *  - la trace ecrite ne contient ni prompt, ni corps, ni jeton.
 */

import assert from 'node:assert/strict'
import { test, beforeEach, after } from 'node:test'

import {
    AI_GATEWAY_HOST_PATTERN,
    AI_MODELS,
    gatewayStatus,
    isEuropeanAiHost,
    readVertexConfig,
    vertexModelId,
} from '../../src/library/ai/gateway-config.js'
import {
    AiGatewayHostRefusedError,
    AiGatewayNotConfiguredError,
    createAiGateway,
    describeVertexUrl,
    gatewayErrorResponse,
    getAiGateway,
    pcmToWav,
    resetAiGatewayForTests,
} from '../../src/library/ai/gateway.js'

const ENV_KEYS = [
    'GOOGLE_VERTEX_PROJECT', 'GOOGLE_VERTEX_LOCATION', 'GOOGLE_VERTEX_CLIENT_EMAIL', 'GOOGLE_VERTEX_PRIVATE_KEY',
    'VERCEL_ENV', 'VERCEL', 'GOOGLE_VERTEX_API_KEY', 'AI_GATEWAY_TEST_ACCESS_TOKEN',
    'ANTHROPIC_API_KEY', 'ANTHROPIC_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY',
    'OPENAI_API_KEY', 'PERPLEXITY_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_SUPPORT_CHAT_ID',
]
const saved = Object.fromEntries(ENV_KEYS.map(k => [k, process.env[k]]))

const FAKE = Object.freeze({
    GOOGLE_VERTEX_PROJECT: 'sdp-test',
    GOOGLE_VERTEX_CLIENT_EMAIL: 'svc@sdp-test.iam.gserviceaccount.com',
    GOOGLE_VERTEX_PRIVATE_KEY: ['cle-de-test', 'ligne-2'].join('\\n'),
})

function resetEnv() {
    for (const k of ENV_KEYS) delete process.env[k]
    resetAiGatewayForTests()
}
function setFake(extra = {}) {
    Object.assign(process.env, FAKE, extra)
}

/** fetch factice : n'emet rien, renvoie 200 et journalise l'URL. */
function fakeFetch(calls, body = '{}') {
    return async (input, init) => {
        calls.push({ url: String(input instanceof URL ? input : input?.url ?? input), init })
        return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
}

beforeEach(resetEnv)
after(() => {
    resetEnv()
    for (const [k, v] of Object.entries(saved)) if (v !== undefined) process.env[k] = v
})

test('en production, sans variables Vertex : refus explicite, jamais de repli (meme avec les cles US)', () => {
    process.env.VERCEL_ENV = 'production'
    process.env.ANTHROPIC_API_KEY = 'x'
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'x'
    process.env.OPENAI_API_KEY = 'x'
    assert.equal(gatewayStatus().ready, false)
    assert.deepEqual(gatewayStatus().missing, ['GOOGLE_VERTEX_PROJECT', 'GOOGLE_VERTEX_CLIENT_EMAIL', 'GOOGLE_VERTEX_PRIVATE_KEY'])
    assert.throws(() => getAiGateway(), err => err instanceof AiGatewayNotConfiguredError && err.status === 503)
    // La reponse utilisateur ne fuit aucun detail technique.
    const res = gatewayErrorResponse(new AiGatewayNotConfiguredError())
    assert.equal(res.status, 503)
})

test('en local aussi : sans Vertex, refus (pas de terminal americain « pour que ca marche »)', () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'x'
    assert.throws(() => getAiGateway(), err => err.code === 'AI_GATEWAY_NOT_CONFIGURED')
})

test('configuration incomplete = absente ; region hors UE = interdite', () => {
    process.env.GOOGLE_VERTEX_PROJECT = 'sdp-test'
    assert.equal(readVertexConfig(), null)
    setFake({ GOOGLE_VERTEX_LOCATION: 'us-central1' })
    assert.throws(() => readVertexConfig(), err => err.code === 'AI_GATEWAY_REGION_NOT_EU')
    assert.equal(gatewayStatus().error, 'AI_GATEWAY_REGION_NOT_EU')
    setFake({ GOOGLE_VERTEX_LOCATION: 'global' })
    assert.throws(() => readVertexConfig(), err => err.code === 'AI_GATEWAY_REGION_NOT_EU')
    setFake({ GOOGLE_VERTEX_LOCATION: 'eu' })
    assert.throws(() => readVertexConfig(), err => err.code === 'AI_GATEWAY_REGION_NOT_EU')
})

test('la cle privee est deserialisee (\\n echappes) et jamais exposee dans la config publique', () => {
    setFake()
    const cfg = readVertexConfig()
    assert.equal(cfg.privateKey, 'cle-de-test\nligne-2')
    const gw = createAiGateway({ getAccessToken: [MASQUÉ] () => 'tok' })
    assert.deepEqual(Object.keys(gw.config).sort(), ['host', 'location', 'project'])
    assert.equal(gw.config.host, 'europe-west1-aiplatform.googleapis.com')
})

test('hotes : seuls europe-*-aiplatform.googleapis.com sont europeens', () => {
    for (const host of ['europe-west1-aiplatform.googleapis.com', 'europe-west9-aiplatform.googleapis.com', 'EUROPE-WEST4-aiplatform.googleapis.com']) {
        assert.equal(isEuropeanAiHost(host), true, host)
    }
    for (const host of [
        'aiplatform.googleapis.com', 'us-central1-aiplatform.googleapis.com', 'aiplatform.eu.rep.googleapis.com',
        'generativelanguage.googleapis.com', 'api.anthropic.com', 'api.openai.com', 'europe-west1-aiplatform.googleapis.com.evil.io',
        'evil-europe-west1-aiplatform.googleapis.com', '',
    ]) {
        assert.equal(isEuropeanAiHost(host), false, host)
    }
    assert.match('europe-west1-aiplatform.googleapis.com', AI_GATEWAY_HOST_PATTERN)
})

test('chaque terminal construit (Gemini texte, Claude, embeddings) vise un hote europeen', async () => {
    setFake()
    const calls = []
    const gw = createAiGateway({ getAccessToken: [MASQUÉ] () => 'tok', fetch: fakeFetch(calls) })

    const gemini = gw.languageModel(AI_MODELS.TEXT_PRO)
    assert.equal(gemini.modelId, 'gemini-2.5-pro')
    await gemini.doGenerate({ prompt: [{ role: 'user', content: [{ type: 'text', text: 'ping' }] }] }).catch(() => {})

    const claude = gw.languageModel(AI_MODELS.CLAUDE_SONNET)
    assert.equal(claude.modelId, vertexModelId('claude-sonnet-4-5'))
    await claude.doGenerate({ prompt: [{ role: 'user', content: [{ type: 'text', text: 'ping' }] }] }).catch(() => {})

    const embedding = gw.embeddingModel()
    assert.equal(embedding.modelId, 'gemini-embedding-001')
    await embedding.doEmbed({ values: ['ping'], providerOptions: gw.embedProviderOptions(768) }).catch(() => {})

    await gw.synthesizeSpeech({ text: 'bonjour' }).catch(() => {})

    assert.ok(calls.length >= 4, `appels captes : ${calls.length}`)
    const hosts = calls.map(c => new URL(c.url).hostname)
    assert.deepEqual([...new Set(hosts)], ['europe-west1-aiplatform.googleapis.com'])
    const paths = calls.map(c => new URL(c.url).pathname)
    assert.ok(paths.some(p => p.includes('/publishers/google/models/gemini-2.5-pro:')), 'gemini')
    assert.ok(paths.some(p => p.includes('/publishers/anthropic/models/claude-sonnet-4-5@20250929:')), 'claude')
    assert.ok(paths.some(p => p.includes('/publishers/google/models/gemini-embedding-001:')), 'embedding')
    assert.ok(paths.some(p => p.includes('/publishers/google/models/gemini-2.5-flash-tts:generateContent')), 'tts')
    for (const p of paths) assert.match(p, /\/locations\/europe-west1\//)
})

test('la region est surchargeable mais reste europeenne (europe-west9 = Paris)', () => {
    setFake({ GOOGLE_VERTEX_LOCATION: 'europe-west9' })
    const gw = createAiGateway({ getAccessToken: [MASQUÉ] () => 'tok' })
    assert.equal(gw.config.host, 'europe-west9-aiplatform.googleapis.com')
})

test('fail-closed : un SDK qui viserait un hote hors Europe est refuse AVANT emission', async () => {
    setFake()
    const calls = []
    const gw = createAiGateway({ getAccessToken: [MASQUÉ] () => 'tok', fetch: fakeFetch(calls) })
    // On simule un fournisseur qui recevrait le transport de la passerelle.
    const tracedFetch = gw.languageModel(AI_MODELS.TEXT_FAST).config?.fetch
    assert.equal(typeof tracedFetch, 'function', 'le modele porte le transport trace')
    for (const url of [
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        'https://api.anthropic.com/v1/messages',
        'https://aiplatform.googleapis.[CHAÎNE OPAQUE MASQUÉE]:generateContent',
        'https://us-central1-aiplatform.googleapis.[CHAÎNE OPAQUE MASQUÉE]:generateContent',
    ]) {
        await assert.rejects(tracedFetch(url, { method: 'POST' }), err => err instanceof AiGatewayHostRefusedError, url)
    }
    assert.equal(calls.length, 0, 'aucune emission ne doit avoir eu lieu')
})

test('la trace ne contient ni prompt, ni corps, ni jeton : seulement hote, modele, operation, statut, duree', async () => {
    setFake()
    const traces = []
    const gw = createAiGateway({
        getAccessToken: [MASQUÉ] () => 'JETON-SECRET',
        fetch: fakeFetch([]),
        onTrace: t => traces.push(t),
    })
    await gw.languageModel(AI_MODELS.TEXT_FAST)
        .doGenerate({ prompt: [{ role: 'user', content: [{ type: 'text', text: 'NIR [NIR MASQUÉ]' }] }] })
        .catch(() => {})
    assert.equal(traces.length, 1)
    assert.deepEqual(Object.keys(traces[0]).sort(), ['gw', 'host', 'model', 'ms', 'op', 'status'])
    assert.equal(traces[0].host, 'europe-west1-aiplatform.googleapis.com')
    assert.equal(traces[0].model, 'gemini-2.5-flash')
    assert.equal(traces[0].op, 'generateContent')
    const serialized = JSON.stringify(traces[0])
    assert.doesNotMatch(serialized, /NIR|JETON-SECRET|085/)
})

test('le jeton de test AI_GATEWAY_TEST_ACCESS_TOKEN est honore en local seulement, IGNORE sur Vercel et en production', async () => {
    setFake()
    const jetonDeTest = ['jeton', 'de', 'test'].join('-')
    process.env.AI_GATEWAY_TEST_ACCESS_TOKEN = [MASQUÉ]
    delete process.env.VERCEL
    const ping = { prompt: [{ role: 'user', content: [{ type: 'text', text: 'ping' }] }] }

    // Local : le jeton de test sert d'Authorization sur l'appel trace.
    const localCalls = []
    await createAiGateway({ fetch: fakeFetch(localCalls) }).languageModel(AI_MODELS.TEXT_FAST).doGenerate(ping).catch(() => {})
    assert.equal(localCalls.length, 1)
    assert.equal(new Headers(localCalls[0].init?.headers).get('authorization'), `Bearer ${jetonDeTest}`)

    // Sur Vercel (Preview comprise) : ignore -> compte de service -> avec une cle
    // fictive, la signature echoue AVANT tout reseau, et rien ne part.
    process.env.VERCEL = '1'
    const vercelCalls = []
    await assert.rejects(
        createAiGateway({ fetch: fakeFetch(vercelCalls) }).languageModel(AI_MODELS.TEXT_FAST).doGenerate(ping)
    )
    assert.equal(vercelCalls.length, 0)

    // En production : idem.
    delete process.env.VERCEL
    process.env.VERCEL_ENV = 'production'
    const prodCalls = []
    await assert.rejects(
        createAiGateway({ fetch: fakeFetch(prodCalls) }).languageModel(AI_MODELS.TEXT_FAST).doGenerate(ping)
    )
    assert.equal(prodCalls.length, 0)
    delete process.env.AI_GATEWAY_TEST_ACCESS_TOKEN
})

test('l express mode du SDK (GOOGLE_VERTEX_API_KEY) est neutralise : toujours le terminal regional europeen', async () => {
    setFake()
    process.env.GOOGLE_VERTEX_API_KEY = ['cle', 'express'].join('-')
    const calls = []
    const gw = createAiGateway({ getAccessToken: [MASQUÉ] () => 'tok', fetch: fakeFetch(calls) })
    await gw.languageModel(AI_MODELS.TEXT_FAST).doGenerate({ prompt: [{ role: 'user', content: [{ type: 'text', text: 'ping' }] }] }).catch(() => {})
    await gw.embeddingModel().doEmbed({ values: ['ping'] }).catch(() => {})
    delete process.env.GOOGLE_VERTEX_API_KEY
    assert.equal(calls.length, 2, 'les deux appels doivent etre emis (pas refuses)')
    assert.deepEqual([...new Set(calls.map(c => new URL(c.url).hostname))], ['europe-west1-aiplatform.googleapis.com'])
    for (const c of calls) assert.equal(new Headers(c.init?.headers).get('x-goog-api-key'), null, 'aucune cle API express')
})

test('utilitaires : description d URL et encapsulation WAV', () => {
    assert.deepEqual(
        describeVertexUrl('[CHAÎNE OPAQUE MASQUÉE]@20250929:streamRawPredict'),
        { model: 'claude-sonnet-4-5@20250929', op: 'streamRawPredict' }
    )
    const wav = pcmToWav(new Uint8Array([1, 2, 3, 4]), 24_000)
    assert.equal(wav.length, 48)
    assert.equal(String.fromCharCode(...wav.slice(0, 4)), 'RIFF')
    assert.equal(String.fromCharCode(...wav.slice(8, 12)), 'WAVE')
    assert.equal(new DataView(wav.buffer).getUint32(24, true), 24_000)
})
