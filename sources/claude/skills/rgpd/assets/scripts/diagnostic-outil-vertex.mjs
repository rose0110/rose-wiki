/**
 * Diagnostic : quels mots-cles de schema JSON Vertex AI refuse dans une
 * declaration d'outil (function calling). Teste, avec la vraie cle, le schema
 * de l'outil `resoudreFaitsConventionnels` puis des variantes allegees.
 *
 * Usage : SDP_VERTEX_ENV_FILE=<fichier.env> node scripts/ia-europe/diagnostic-outil-vertex.mjs
 * (n'affiche que le statut et le message d'erreur Vertex, jamais la cle)
 */
import { readFileSync } from 'node:fs'
import { generateText, jsonSchema, tool } from 'ai'

const envFile = process.env.SDP_VERTEX_ENV_FILE
if (!envFile) throw new Error('SDP_VERTEX_ENV_FILE requis')
for (const rawLine of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const key = line.slice(0, line.indexOf('=')).trim()
    if (!key.startsWith('GOOGLE_VERTEX_')) continue
    let value = line.slice(line.indexOf('=') + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    process.env[key] = value.replace(/\\n/g, '\n')
}
process.env.VERCEL = ''
process.env.VERCEL_ENV = 'development'

const { createAiGateway, AI_MODELS } = await import('../../src/library/ai/gateway.js')
const gw = createAiGateway()

const complet = {
    type: 'object',
    additionalProperties: false,
    properties: {
        idcc: { type: 'string', pattern: '^\\d{1,4}$', description: 'Code IDCC' },
        ruleCodes: { type: 'array', minItems: 1, maxItems: 12, uniqueItems: true, items: { type: 'string', pattern: '^[a-z]+$' }, description: 'Codes' },
        context: {
            type: 'object',
            additionalProperties: false,
            properties: {
                classification_level_uuid: { type: 'string', format: 'uuid' },
                seniority_months: { type: 'number', minimum: 0, maximum: 1200 },
            },
        },
    },
    required: ['idcc', 'ruleCodes'],
}
const clone = (fn) => { const s = JSON.parse(JSON.stringify(complet)); fn(s); return s }
const variantes = {
    complet,
    'sans additionalProperties': clone(s => { delete s.additionalProperties; delete s.properties.context.additionalProperties }),
    'sans uniqueItems': clone(s => { delete s.properties.ruleCodes.uniqueItems }),
    'sans format uuid': clone(s => { delete s.properties.context.properties.classification_level_uuid.format }),
    'sans pattern': clone(s => { delete s.properties.idcc.pattern; delete s.properties.ruleCodes.items.pattern }),
    'sans min/max': clone(s => { delete s.properties.ruleCodes.minItems; delete s.properties.ruleCodes.maxItems; delete s.properties.context.properties.seniority_months.minimum; delete s.properties.context.properties.seniority_months.maximum }),
    'minimal': { type: 'object', properties: { idcc: { type: 'string' } }, required: ['idcc'] },
}

for (const [nom, schema] of Object.entries(variantes)) {
    try {
        await generateText({
            model: gw.languageModel(AI_MODELS.TEXT_FAST),
            tools: { resoudreFaitsConventionnels: tool({ description: 'Resout des faits CCN.', inputSchema: jsonSchema(schema), execute: async () => ({ ok: true }) }) },
            prompt: 'Reponds juste : bonjour',
        })
        console.log(`OK   ${nom}`)
    } catch (error) {
        const body = String(error?.responseBody || '')
        const msg = body.match(/"message":\s*"([^"]{0,220})/)?.[1] || error?.message?.slice(0, 200)
        console.log(`400? ${nom} -> ${error?.status ?? error?.statusCode ?? ''} ${msg}`)
    }
}
