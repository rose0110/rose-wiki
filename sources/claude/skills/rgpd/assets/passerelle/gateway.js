/**
 * Passerelle IA europeenne — POINT DE SORTIE UNIQUE de tous les appels d'IA
 * de l'application.
 *
 * Ce fichier est le seul de `src/` autorise a importer un fournisseur d'IA
 * (`tests/ia-europe/` le verifie par analyse statique). Il ne connait que des
 * terminaux Vertex AI en Union europeenne :
 *
 *   https://<region-ue>-aiplatform.googleapis.com/...
 *
 * Trois garanties, chacune testee sans reseau :
 *   1. Pas de repli : sans configuration Vertex, la passerelle REFUSE, elle ne
 *      retombe jamais sur un terminal americain « pour que ca marche ». C'est
 *      le defaut qui a laisse la promesse « aucun transfert hors UE » fausse
 *      pendant un mois (bascule Vertex fusionnee le 12/08, jamais activee).
 *   2. Fail-closed a l'execution : chaque requete sortante passe par un fetch
 *      qui verifie l'hote AVANT d'emettre. Un hote hors `europe-*` est refuse
 *      meme si un SDK construisait une autre URL.
 *   3. Trace sans donnee personnelle : chaque appel ecrit une ligne
 *      `[ai-gateway] {"host","model","op","status","ms"}` dans les journaux —
 *      c'est elle qui permet de PROUVER en production l'hote contacte.
 *
 * Ce que la passerelle ne fait pas : compter les couts. `withAiMeter`
 * (`./meter.js`) reste le point de passage des plafonds et du journal
 * `ai_usage` ; les routes l'enveloppent autour des appels comme avant.
 *
 * Usage :
 *   import { aiLanguageModel, aiEmbeddingModel, aiEmbedProviderOptions } from '@/library/ai/gateway'
 *   streamText({ model: aiLanguageModel('gemini-2.5-pro'), ... })
 *   embed({ model: aiEmbeddingModel(), value, providerOptions: aiEmbedProviderOptions(768) })
 */

import { createVertex } from '@ai-sdk/google-vertex'
import { createVertexAnthropic } from '@ai-sdk/google-vertex/anthropic'
import { GoogleAuth } from 'google-auth-library'

import {
    AI_GATEWAY_AUTH_HOST,
    AI_MODELS,
    isClaudeModel,
    isEuropeanAiHost,
    isProductionRuntime,
    readVertexConfig,
    vertexModelId,
} from './gateway-config.js'

export { AI_MODELS, AI_GATEWAY_AUTH_HOST, gatewayStatus } from './gateway-config.js'

export class AiGatewayError extends Error {
    constructor(code, message, status = 503) {
        super(message)
        this.name = 'AiGatewayError'
        this.code = code
        this.status = status
    }
}

/** Levee quand les variables Vertex manquent : aucun appel n'est tente. */
export class AiGatewayNotConfiguredError extends AiGatewayError {
    constructor(detail) {
        super(
            'AI_GATEWAY_NOT_CONFIGURED',
            "Le service d'intelligence artificielle n'est pas disponible : la passerelle européenne n'est pas configurée. Aucune donnée n'a été transmise."
        )
        this.name = 'AiGatewayNotConfiguredError'
        this.detail = detail || null
    }
}

/** Levee quand un SDK tente de contacter un hote hors Union europeenne. */
export class AiGatewayHostRefusedError extends AiGatewayError {
    constructor(hostname) {
        super('AI_GATEWAY_HOST_REFUSED', `AI_GATEWAY_HOST_REFUSED:${hostname}`)
        this.name = 'AiGatewayHostRefusedError'
        this.hostname = hostname
    }
}

/** Message utilisateur d'une erreur de passerelle (jamais de detail technique). */
export function gatewayErrorResponse(err) {
    // Couvre aussi l'erreur de region levee par gateway-config.js (module sans
    // dependance, qui ne peut pas importer AiGatewayError) : tout code
    // AI_GATEWAY_* est une erreur de passerelle.
    const isGateway = err instanceof AiGatewayError || String(err?.code || '').startsWith('AI_GATEWAY_')
    if (!isGateway) return null
    return new Response(
        JSON.stringify({
            error: 'Service IA indisponible',
            message: "Le service d'intelligence artificielle est momentanément indisponible. Aucune donnée n'a été transmise. Réessayez plus tard ou contactez le support.",
            code: err.code,
        }),
        { status: err.status || 503, headers: { 'Content-Type': 'application/json' } }
    )
}

const AUDIO_SAMPLE_RATE_DEFAULT = 24_000

/**
 * Encapsule du PCM 16 bits mono en WAV lisible par un navigateur.
 * @param {Uint8Array} pcm
 * @param {number} sampleRate
 */
export function pcmToWav(pcm, sampleRate = AUDIO_SAMPLE_RATE_DEFAULT) {
    const channels = 1
    const bitsPerSample = 16
    const byteRate = sampleRate * channels * (bitsPerSample / 8)
    const header = new ArrayBuffer(44)
    const view = new DataView(header)
    const writeAscii = (offset, text) => {
        for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
    }
    writeAscii(0, 'RIFF')
    view.setUint32(4, 36 + pcm.byteLength, true)
    writeAscii(8, 'WAVE')
    writeAscii(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, channels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, channels * (bitsPerSample / 8), true)
    view.setUint16(34, bitsPerSample, true)
    writeAscii(36, 'data')
    view.setUint32(40, pcm.byteLength, true)

    const wav = new Uint8Array(44 + pcm.byteLength)
    wav.set(new Uint8Array(header), 0)
    wav.set(pcm, 44)
    return wav
}

/** Extrait { model, op } d'une URL Vertex, sans rien lire d'autre. */
export function describeVertexUrl(url) {
    const match = String(url).match(/\/models\/([^/:?]+):([A-Za-z]+)/)
    return { model: match?.[1] ?? null, op: match?.[2] ?? null }
}

let alertedOnce = false
async function alerterRose(detail) {
    if (alertedOnce) return false
    alertedOnce = true
    let telegramSent = false
    try {
        const { sendTelegramMessage } = await import('../clients/telegram.js')
        // Message audite par scripts/audit-alertes.mjs : ce qui est casse, depuis
        // quand, l'impact pour les utilisateurs, l'action a faire.
        const environnement = String(detail?.environment || 'inconnu')
        const tgText =
            `🔴 <b>Passerelle IA europeenne non configuree</b>\n` +
            `Casse : les appels IA sont REFUSES (aucun repli hors UE), depuis ${new Date().toISOString()}.\n` +
            `Impact : chat, Agent Paie, controle de paie, report de conges, resume et voix repondent 503 aux utilisateurs.\n` +
            `Variables attendues : GOOGLE_VERTEX_PROJECT, GOOGLE_VERTEX_CLIENT_EMAIL, GOOGLE_VERTEX_PRIVATE_KEY (environnement ${environnement}).\n` +
            `Action : poser GOOGLE_VERTEX_* dans Vercel (Production + Preview) avec scripts/ia-europe/poser-variables-vertex.mjs puis redeployer.`
        const tgRes = await sendTelegramMessage(tgText)
        telegramSent = tgRes.ok
        if (!tgRes.ok) {
            console.error('[ai-gateway] alerte Telegram KO:', tgRes.error || 'statut Telegram non livre')
        }
        return telegramSent
    } catch (error) {
        // L'alerte est best-effort : le refus, lui, est deja acquis. On le dit.
        console.error('[ai-gateway]', JSON.stringify({ gw: 'vertex-eu', alerte: 'telegram-exception', code: error?.code || error?.name || 'inconnu' }))
        return false
    }
}

/**
 * Construit une passerelle. Les routes n'appellent pas cette fabrique : elles
 * utilisent `getAiGateway()` (singleton). La fabrique existe pour les tests,
 * qui injectent une configuration et un jeton fictifs.
 *
 * @param {object} [options]
 * @param {object} [options.env]              defaut process.env
 * @param {object|null} [options.config]      defaut readVertexConfig(env)
 * @param {() => Promise<string>} [options.getAccessToken]  jeton OAuth (tests)
 * @param {typeof fetch} [options.fetch]      transport (tests)
 * @param {(trace:object) => void} [options.onTrace]
 */
export function createAiGateway(options = {}) {
    const env = options.env || process.env
    const config = options.config === undefined ? readVertexConfig(env) : options.config
    if (!config) {
        const detail = {
            missing: ['GOOGLE_VERTEX_PROJECT', 'GOOGLE_VERTEX_CLIENT_EMAIL', 'GOOGLE_VERTEX_PRIVATE_KEY'].filter(
                key => !env[key]
            ),
            environment: env.VERCEL_ENV || 'local',
        }
        if (isProductionRuntime(env)) void alerterRose(detail)
        throw new AiGatewayNotConfiguredError(detail)
    }

    const baseFetch = options.fetch || globalThis.fetch
    const onTrace = options.onTrace || null

    // --- Authentification : compte de service (cle privee chiffree dans Vercel).
    //     L'echange JWT -> jeton part vers oauth2.googleapis.com, sans donnee metier.
    //     Hors production seulement, AI_GATEWAY_TEST_ACCESS_TOKEN remplace le jeton :
    //     la garde reseau de bout en bout (scripts/ia-europe/garde-reseau-serveur.mjs)
    //     exerce ainsi les vraies routes jusqu'au terminal europeen sans credential.
    //     Sur Vercel (toute cible, VERCEL=1) et en production, cette variable est
    //     IGNOREE : un garde-fou qui ne dependrait que de VERCEL_ENV serait
    //     contournable hors Vercel (verdict securite-rgpd 11/09, D-2).
    const testToken =
        [MASQUÉ] && env.VERCEL !== '1' && env.AI_GATEWAY_TEST_ACCESS_TOKEN
            ? env.AI_GATEWAY_TEST_ACCESS_TOKEN
            : [MASQUÉ]
    const getAccessToken =
        [MASQUÉ] ||
        (testToken ? async () => testToken : [MASQUÉ] ||
        (() => {
            let auth = null
            return async () => {
                if (!auth) {
                    auth = new GoogleAuth({
                        credentials: { client_email: config.clientEmail, private_key: config.privateKey },
                        projectId: config.project,
                        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
                    })
                }
                const client = await auth.getClient()
                const { token } = await client.getAccessToken()
                if (!token) throw new AiGatewayError('AI_GATEWAY_AUTH_FAILED', 'AI_GATEWAY_AUTH_FAILED')
                return token
            }
        })()

    // --- Transport fail-closed + trace sans donnee personnelle.
    const tracedFetch = async (input, init) => {
        const raw = typeof input === 'string' || input instanceof URL ? input : input?.url
        const url = new URL(String(raw))
        if (!isEuropeanAiHost(url.hostname)) {
            const refused = new AiGatewayHostRefusedError(url.hostname)
            console.error('[ai-gateway]', JSON.stringify({ gw: 'vertex-eu', refused: url.hostname }))
            throw refused
        }
        const { model, op } = describeVertexUrl(url.pathname)
        const started = Date.now()
        let status = null
        try {
            const response = await baseFetch(input, init)
            status = response.status
            // Diagnostic local uniquement (jamais sur Vercel ni en production) :
            // le corps d'erreur du fournisseur decrit le champ de requete
            // fautif (schema d'outil, option non supportee), pas nos donnees.
            if (response.status >= 400 && env.AI_GATEWAY_DEBUG_ERRORS === '1' && env.VERCEL !== '1' && !isProductionRuntime(env)) {
                const body = await response.clone().text().catch(() => '')
                console.error('[ai-gateway] debug', response.status, body.slice(0, 800))
            }
            return response
        } catch (error) {
            status = `error:${error?.code || error?.name || 'fetch'}`
            throw error
        } finally {
            const trace = { gw: 'vertex-eu', host: url.hostname, model, op, status, ms: Date.now() - started }
            console.info('[ai-gateway]', JSON.stringify(trace))
            if (onTrace) onTrace(trace)
        }
    }

    // Jeton fourni au SDK via un `authClient` minimal : GoogleAuth le renvoie
    // tel quel (cachedCredential), sans chercher de credential ambiant.
    const authClient = { getAccessToken: [MASQUÉ] () => ({ token: [MASQUÉ] getAccessToken() }) }

    const vertex = createVertex({
        project: config.project,
        location: config.location,
        // `apiKey: ''` neutralise l'« express mode » du SDK : si une variable
        // GOOGLE_VERTEX_API_KEY existait dans l'environnement, createVertex
        // basculerait sur le terminal GLOBAL aiplatform.googleapis.com. Une
        // chaine vide est retournee telle quelle par le SDK et coupe cette
        // lecture (verdict securite-rgpd 11/09, durcissement D-1).
        apiKey: '',
        googleAuthOptions: { authClient, projectId: config.project },
        fetch: tracedFetch,
    })

    const anthropic = createVertexAnthropic({
        project: config.project,
        location: config.location,
        generateAuthToken: [MASQUÉ],
        fetch: tracedFetch,
    })

    function languageModel(modelId = AI_MODELS.TEXT_FAST) {
        if (isClaudeModel(modelId)) return anthropic(vertexModelId(modelId))
        return vertex(modelId)
    }

    function embeddingModel(modelId = AI_MODELS.EMBEDDING) {
        return vertex.textEmbeddingModel(modelId)
    }

    /** Options de dimension (768 pour les colonnes vector(768) existantes). */
    function embedProviderOptions(outputDimensionality = 768) {
        return { vertex: { outputDimensionality } }
    }

    /**
     * Recherche web par « Web Grounding for Enterprise », executee DANS la
     * requete Vertex (meme hote UE, meme trace). Remplace le service de
     * recherche americain (Tavily) : la requete ne quitte plus la passerelle.
     * Retenu plutot que « Grounding with Google Search » : la doc Google
     * « zero data retention » (2026-09-09) indique que ce dernier conserve les
     * requetes jusqu'a 3 jours sans possibilite de desactivation, alors que
     * Web Grounding for Enterprise est la voie recommandee pour zero retention.
     * Le modele doit recevoir l'outil sous le nom `enterprise_web_search`.
     */
    function webSearchTool() {
        return vertex.tools.enterpriseWebSearch({})
    }

    /**
     * Synthese vocale via Gemini 2.5 Flash TTS (Vertex, region UE). Le SDK ne
     * sait pas demander une modalite AUDIO : appel REST direct, meme hote,
     * meme transport trace. Retour PCM 24 kHz -> WAV.
     */
    async function synthesizeSpeech({ text, voice = 'Kore', language = 'fr-FR' }) {
        const content = String(text || '').trim()
        if (!content) throw new AiGatewayError('AI_GATEWAY_EMPTY_TEXT', 'texte vide', 400)
        const url = `https://${config.host}/v1/projects/${config.project}/locations/${config.location}/publishers/google/models/${AI_MODELS.SPEECH}:generateContent`
        const response = await tracedFetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${await getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: content }] }],
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        languageCode: language,
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                    },
                },
            }),
        })
        if (!response.ok) {
            throw new AiGatewayError('AI_GATEWAY_SPEECH_FAILED', `AI_GATEWAY_SPEECH_FAILED:${response.status}`, 502)
        }
        const payload = await response.json()
        const part = payload?.candidates?.[0]?.content?.parts?.find(p => p?.inlineData?.data)
        if (!part) throw new AiGatewayError('AI_GATEWAY_SPEECH_EMPTY', 'AI_GATEWAY_SPEECH_EMPTY', 502)
        const rate = Number(String(part.inlineData.mimeType || '').match(/rate=(\d+)/)?.[1]) || AUDIO_SAMPLE_RATE_DEFAULT
        const pcm = new Uint8Array(Buffer.from(part.inlineData.data, 'base64'))
        const usageMetadata = payload?.usageMetadata || null

        return {
            audio: { uint8Array: pcmToWav(pcm, rate), mediaType: 'audio/wav' },
            usage: usageMetadata
                ? { inputTokens: [MASQUÉ] ?? 0, outputTokens: [MASQUÉ] ?? 0 }
                : undefined,
        }
    }

    return Object.freeze({
        config: Object.freeze({ project: config.project, location: config.location, host: config.host }),
        languageModel,
        embeddingModel,
        embedProviderOptions,
        webSearchTool,
        synthesizeSpeech,
    })
}

let singleton = null

/** Passerelle de l'application (construite au premier appel, jamais a l'import). */
export function getAiGateway() {
    if (!singleton) singleton = createAiGateway()
    return singleton
}

/** Pour les tests uniquement : oublie le singleton. */
export function resetAiGatewayForTests() {
    singleton = null
    alertedOnce = false
}

export const aiLanguageModel = modelId => getAiGateway().languageModel(modelId)
export const aiEmbeddingModel = modelId => getAiGateway().embeddingModel(modelId)
export const aiEmbedProviderOptions = dim => getAiGateway().embedProviderOptions(dim)
export const aiSynthesizeSpeech = params => getAiGateway().synthesizeSpeech(params)
export const aiWebSearchTool = () => getAiGateway().webSearchTool()
