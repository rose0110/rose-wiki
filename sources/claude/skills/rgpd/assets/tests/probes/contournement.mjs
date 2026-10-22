/**
 * Sonde ADVERSE executee sous la garde reseau : tente de faire sortir un appel
 * IA par un autre chemin que la passerelle. Chaque tentative DOIT etre refusee
 * avant emission (code IA_EUROPE_HOST_REFUSED).
 *
 * Sortie 0 : toutes les tentatives refusees. Sortie 2 : une tentative est
 * passee (fuite). Sortie 3 : erreur inattendue.
 */
import { generateText } from 'ai'

const attempts = {
    // 1. fetch direct vers OpenAI
    'fetch api.openai.com': () => fetch('https://api.openai.com/v1/models', { headers: { Authorization: 'Bearer x' } }),
    // 2. fetch direct vers Anthropic
    'fetch api.anthropic.com': () => fetch('https://api.anthropic.com/v1/messages', { method: 'POST' }),
    // 3. SDK Google direct (terminal global generativelanguage)
    'sdk @ai-sdk/google': async () => {
        process.env.GOOGLE_GENERATIVE_AI_API_KEY = ['cle', 'fictive'].join('-')
        const { google } = await import('@ai-sdk/google')
        return generateText({ model: google('gemini-2.5-flash'), prompt: 'ping' })
    },
    // 4. SDK Anthropic direct
    'sdk @ai-sdk/anthropic': async () => {
        const { createAnthropic } = await import('@ai-sdk/anthropic')
        return generateText({ model: createAnthropic({ apiKey: '[MASQUE]' })('claude-sonnet-4-5'), prompt: 'ping' })
    },
    // 5. Vertex mais region americaine (le SDK construirait us-central1-aiplatform)
    'vertex us-central1': async () => {
        const { createVertex } = await import('@ai-sdk/google-vertex')
        const vertex = createVertex({ project: 'p', location: 'us-central1', headers: { Authorization: 'Bearer x' }, googleAuthOptions: { authClient: { getAccessToken: [MASQUÉ] () => ({ token: 'x' }) } } })
        return generateText({ model: vertex('gemini-2.5-flash'), prompt: 'ping' })
    },
    // 6. Vertex terminal global
    'vertex global': async () => {
        const { createVertex } = await import('@ai-sdk/google-vertex')
        const vertex = createVertex({ project: 'p', location: 'global', googleAuthOptions: { authClient: { getAccessToken: [MASQUÉ] () => ({ token: 'x' }) } } })
        return generateText({ model: vertex('gemini-2.5-flash'), prompt: 'ping' })
    },
    // 7. Passerelle forcee sur une region hors UE : refusee par la configuration, avant tout reseau
    'passerelle us-central1': async () => {
        process.env.GOOGLE_VERTEX_PROJECT = 'p'
        process.env.GOOGLE_VERTEX_CLIENT_EMAIL = 'svc@p.iam.gserviceaccount.com'
        process.env.GOOGLE_VERTEX_PRIVATE_KEY = ['cle', 'test'].join('-')
        process.env.GOOGLE_VERTEX_LOCATION = 'us-central1'
        const { createAiGateway } = await import('../../../src/library/ai/gateway.js')
        return createAiGateway({ getAccessToken: [MASQUÉ] () => 'x' })
    },
    // 8. Socket TCP brut
    'net.connect': async () => {
        const net = await import('node:net')
        return new Promise((_, reject) => {
            try { net.connect(443, 'api.perplexity.ai') } catch (e) { reject(e) }
        })
    },
}

let leaked = 0
let unexpected = 0
for (const [name, run] of Object.entries(attempts)) {
    try {
        await run()
        leaked++
        console.log(`[contournement] ${name}: PASSE (fuite)`)
    } catch (error) {
        const text = `${error?.code || ''} ${error?.message || ''} ${error?.cause?.code || ''} ${error?.cause?.message || ''}`
        if (text.includes('IA_EUROPE_HOST_REFUSED') || text.includes('AI_GATEWAY_REGION_NOT_EU')) {
            console.log(`[contournement] ${name}: refuse`)
        } else {
            unexpected++
            console.log(`[contournement] ${name}: erreur inattendue ${text.slice(0, 160)}`)
        }
    }
}
process.exit(leaked ? 2 : unexpected ? 3 : 0)
