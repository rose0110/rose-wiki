/**
 * Configuration de la passerelle IA europeenne — SANS aucun import de
 * fournisseur. Ce module est lu par la passerelle (`gateway.js`), par le
 * controle de sante quotidien et par les tests statiques : il doit rester
 * importable sans reseau, sans credential et sans effet de bord.
 *
 * Regle du chantier « IA en Europe » (11/09/2026) : tout appel d'IA de
 * l'application sort par un seul point, et ce point ne connait que des
 * terminaux Vertex AI situes en Union europeenne. Un terminal americain n'est
 * jamais un repli : s'il manque une variable, la passerelle refuse.
 *
 * Region retenue : europe-west1 (Belgique). Mesure sur la doc officielle
 * Google Cloud « Emplacements des points de terminaison » (page datee du
 * 2026-09-11) : c'est la seule region UE qui sert a la fois gemini-2.5-flash,
 * gemini-2.5-pro, gemini-embedding-001, gemini-2.5-flash-tts et Claude
 * Sonnet 4.5. La page « Residence des donnees » (2026-09-09) engage le
 * traitement ML dans la juridiction UE pour un terminal regional europeen.
 */

/** Regions Vertex acceptees : uniquement `europe-*`. */
export const AI_GATEWAY_REGION_PATTERN = /^europe-[a-z0-9]+$/

/** Hote d'inference accepte : `<region-ue>-aiplatform.googleapis.com`. */
export const AI_GATEWAY_HOST_PATTERN = /^europe-[a-z0-9]+-aiplatform\.googleapis\.com$/

/**
 * Hote de l'echange de jeton OAuth (JWT signe -> jeton d'acces). Aucune
 * donnee metier n'y transite : seulement l'assertion signee du compte de
 * service. Autorise par la garde reseau au titre de l'authentification.
 */
export const AI_GATEWAY_AUTH_HOST = 'oauth2.googleapis.com'

export const AI_GATEWAY_DEFAULT_LOCATION = 'europe-west1'

/** Variables de projet Vercel (Production ET Preview), valeurs chiffrees. */
export const AI_GATEWAY_ENV_KEYS = Object.freeze([
    'GOOGLE_VERTEX_PROJECT',
    'GOOGLE_VERTEX_CLIENT_EMAIL',
    'GOOGLE_VERTEX_PRIVATE_KEY',
])

/**
 * Catalogue ferme des modeles que la passerelle sait servir. Les identifiants
 * sont ceux que les routes utilisaient deja : le chantier change la region,
 * pas les modeles.
 */
export const AI_MODELS = Object.freeze({
    TEXT_FAST: 'gemini-2.5-flash',
    TEXT_PRO: 'gemini-2.5-pro',
    CLAUDE_SONNET: 'claude-sonnet-4-5',
    EMBEDDING: 'gemini-embedding-001',
    SPEECH: 'gemini-2.5-flash-tts',
})

/** Identifiant Vertex quand il differe de l'identifiant public (Claude utilise « @date »). */
const VERTEX_MODEL_IDS = Object.freeze({
    'claude-sonnet-4-5': 'claude-sonnet-4-5@20250929',
    'claude-sonnet-4-5-20250929': 'claude-sonnet-4-5@20250929',
})

export function vertexModelId(modelId) {
    return VERTEX_MODEL_IDS[modelId] || modelId
}

export function isClaudeModel(modelId) {
    return String(modelId || '').startsWith('claude')
}

export function vertexHost(location) {
    return `${location}-aiplatform.googleapis.com`
}

export function isEuropeanAiHost(hostname) {
    return AI_GATEWAY_HOST_PATTERN.test(String(hostname || '').trim().toLowerCase())
}

export function isProductionRuntime(env = process.env) {
    return env.VERCEL_ENV === 'production'
}

/**
 * Lit la configuration Vertex. Renvoie `null` si une variable manque (la
 * passerelle decide alors de refuser), et LEVE si la region n'est pas
 * europeenne : une region hors UE n'est pas une configuration incomplete,
 * c'est une configuration interdite.
 *
 * La cle privee du compte de service arrive avec des « \n » echappes depuis
 * Vercel : on les deserialise ici, une seule fois.
 */
export function readVertexConfig(env = process.env) {
    const project = env.GOOGLE_VERTEX_PROJECT
    const clientEmail = env.GOOGLE_VERTEX_CLIENT_EMAIL
    const privateKey = env.GOOGLE_VERTEX_PRIVATE_KEY
    if (!project || !clientEmail || !privateKey) return null

    const location = env.GOOGLE_VERTEX_LOCATION || AI_GATEWAY_DEFAULT_LOCATION
    if (!AI_GATEWAY_REGION_PATTERN.test(location)) {
        // Jamais la valeur dans le message : une variable mal posee (ex. blob
        // chiffre) finirait dans un journal ou une reponse.
        const error = new Error('AI_GATEWAY_REGION_NOT_EU')
        error.name = 'AiGatewayError'
        error.code = 'AI_GATEWAY_REGION_NOT_EU'
        error.status = 503
        throw error
    }

    return Object.freeze({
        project,
        location,
        host: vertexHost(location),
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
    })
}

/**
 * Etat lisible par le controle de sante (aucune valeur secrete).
 * @returns {{ready:boolean, production:boolean, location:string|null, host:string|null, missing:string[], error:string|null}}
 */
export function gatewayStatus(env = process.env) {
    const missing = AI_GATEWAY_ENV_KEYS.filter(key => !env[key])
    let config = null
    let error = null
    try {
        config = readVertexConfig(env)
    } catch (e) {
        error = e.code || e.message
    }

    return {
        ready: Boolean(config),
        production: isProductionRuntime(env),
        location: config?.location ?? null,
        host: config?.host ?? null,
        missing,
        error,
    }
}
