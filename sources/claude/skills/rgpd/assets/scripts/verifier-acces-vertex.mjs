/**
 * Verifie, avec une VRAIE cle de compte de service, que la passerelle atteint
 * Vertex AI en region UE pour chaque capacite (texte Gemini, Claude, embeddings,
 * synthese vocale, recherche web ancree). N'affiche que l'hote, le modele,
 * l'operation, le statut et la duree — jamais le contenu ni la cle.
 *
 * Usage : node scripts/ia-europe/verifier-acces-vertex.mjs <cle-compte-de-service.json> [europe-west1]
 * Sortie 0 si toutes les capacites repondent 200 sur un hote europe-*.
 */
import { readFileSync } from 'node:fs'
import { embed, generateText } from 'ai'

const [, , file, location = 'europe-west1'] = process.argv
if (!file) {
    console.error('Usage : node scripts/ia-europe/verifier-acces-vertex.mjs <cle.json> [region]')
    process.exit(2)
}
const key = JSON.parse(readFileSync(file, 'utf8'))
process.env.GOOGLE_VERTEX_PROJECT = key.project_id
process.env.GOOGLE_VERTEX_CLIENT_EMAIL = key.client_email
process.env.GOOGLE_VERTEX_PRIVATE_KEY = key.private_key
process.env.GOOGLE_VERTEX_LOCATION = location
delete process.env.AI_GATEWAY_TEST_ACCESS_TOKEN

const { createAiGateway, AI_MODELS } = await import('../../src/library/ai/gateway.js')
const traces = []
const gw = createAiGateway({ onTrace: t => traces.push(t) })

const steps = {
    gemini: async () => (await generateText({ model: gw.languageModel(AI_MODELS.TEXT_FAST), prompt: 'Reponds par un seul mot : bonjour' })).text.length,
    'gemini-pro': async () => (await generateText({ model: gw.languageModel(AI_MODELS.TEXT_PRO), prompt: 'Reponds par un seul mot : bonjour' })).text.length,
    claude: async () => (await generateText({ model: gw.languageModel(AI_MODELS.CLAUDE_SONNET), prompt: 'Reponds par un seul mot : bonjour' })).text.length,
    embedding: async () => (await embed({ model: gw.embeddingModel(), value: 'bonjour', providerOptions: gw.embedProviderOptions(768) })).embedding.length,
    speech: async () => (await gw.synthesizeSpeech({ text: 'Bonjour, ceci est un test.' })).audio.uint8Array.length,
    recherche: async () =>
        (await generateText({ model: gw.languageModel(AI_MODELS.TEXT_FAST), tools: { enterprise_web_search: gw.webSearchTool() }, prompt: 'Quel est le montant du SMIC horaire brut en France aujourd hui ? Une phrase.' })).text.length,
}

const results = {}
for (const [name, run] of Object.entries(steps)) {
    try {
        const size = await run()
        results[name] = { ok: true, size }
    } catch (error) {
        results[name] = { ok: false, code: error?.code || error?.name || 'ERREUR', status: error?.status ?? error?.statusCode ?? error?.cause?.status ?? null }
    }
}

console.log(JSON.stringify({ project: key.project_id, location, results, traces }, null, 2))
const hosts = [...new Set(traces.map(t => t.host))]
const allOk = Object.values(results).every(r => r.ok) && hosts.every(h => /^europe-[a-z0-9]+-aiplatform\.googleapis\.com$/.test(h))
process.exit(allOk ? 0 : 1)
