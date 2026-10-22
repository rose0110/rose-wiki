/**
 * Sonde executee SOUS la garde reseau (garde-reseau-preload.cjs) : exerce la
 * passerelle avec une configuration de test et un jeton fictif, sur chaque
 * capacite (texte Gemini, Claude, embeddings, synthese vocale, recherche web
 * ancree). Les appels echouent cote fournisseur (jeton invalide) — ce qui est
 * mesure, c'est la CIBLE de chaque connexion, journalisee par le prechargeur.
 *
 * Sortie 0 : aucun hote refuse. Sortie 3 : la garde a refuse un hote.
 */
import { embed, generateText } from 'ai'

process.env.GOOGLE_VERTEX_PROJECT = 'sdp-garde-reseau'
process.env.GOOGLE_VERTEX_CLIENT_EMAIL = 'svc@sdp-garde-reseau.iam.gserviceaccount.com'
process.env.GOOGLE_VERTEX_PRIVATE_KEY = ['cle-de-test', 'ligne-2'].join('\\n')
process.env.GOOGLE_VERTEX_LOCATION = process.env.IA_EUROPE_PROBE_LOCATION || 'europe-west1'

const { createAiGateway, AI_MODELS } = await import('../../../src/library/ai/gateway.js')
const gw = createAiGateway({ getAccessToken: [MASQUÉ] () => 'jeton-de-test' })

const steps = {
    gemini: () => generateText({ model: gw.languageModel(AI_MODELS.TEXT_FAST), prompt: 'ping' }),
    claude: () => generateText({ model: gw.languageModel(AI_MODELS.CLAUDE_SONNET), prompt: 'ping' }),
    embedding: () => embed({ model: gw.embeddingModel(), value: 'ping', providerOptions: gw.embedProviderOptions(768) }),
    speech: () => gw.synthesizeSpeech({ text: 'bonjour' }),
    recherche: () => generateText({ model: gw.languageModel(AI_MODELS.TEXT_FAST), tools: { enterprise_web_search: gw.webSearchTool() }, prompt: 'ping' }),
}

let refused = 0
for (const [name, run] of Object.entries(steps)) {
    try {
        await run()
        console.log(`[probe] ${name}: reponse inattendue (jeton fictif)`)
    } catch (error) {
        const code = error?.code || error?.cause?.code || error?.name
        if (String(code).includes('IA_EUROPE_HOST_REFUSED') || String(error?.message).includes('IA_EUROPE_HOST_REFUSED')) refused++
        console.log(`[probe] ${name}: ${code}`)
    }
}
process.exit(refused ? 3 : 0)
