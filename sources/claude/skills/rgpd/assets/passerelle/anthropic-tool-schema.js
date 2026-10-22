import { asSchema, jsonSchema } from 'ai'

/**
 * Adapte des outils (AI SDK) pour les modeles Claude : l'API Anthropic refuse un
 * `input_schema` qui porte `allOf`, `anyOf`, `oneOf` (ou `if/then/else`, `not`)
 * AU PREMIER NIVEAU — Gemini les accepte. Mesure en production le 11/09/2026 :
 * « tools.8.custom.input_schema: input_schema does not support oneOf, allOf, or
 * anyOf at the top level » sur `runMaintienSalaireTool`, ce qui faisait tomber
 * TOUT le mode Claude de l'Agent Paie.
 *
 * Les conditions entre champs exprimees par ces mots-cles sont deja verifiees a
 * l'execution par les outils concernes (`mapInputs` / gardes C08) : les retirer du
 * schema envoye au modele ne retire aucune verification, seulement une indication.
 * Les outils sans composition au premier niveau sont renvoyes tels quels (meme
 * reference : leur validation zod eventuelle est conservee).
 */
export const ANTHROPIC_UNSUPPORTED_TOP_LEVEL_KEYS = Object.freeze(['allOf', 'anyOf', 'oneOf', 'if', 'then', 'else', 'not'])

const NOTE = 'Les conditions entre champs (selon le mode, le motif ou la prolongation) sont verifiees a l execution.'

export function hasUnsupportedTopLevelComposition(schema) {
    return Boolean(schema) && typeof schema === 'object' && ANTHROPIC_UNSUPPORTED_TOP_LEVEL_KEYS.some(key => key in schema)
}

/**
 * @param {Record<string, object>} tools outils AI SDK (`tool({...})`)
 * @returns {{ tools: Record<string, object>, adapted: string[] }}
 */
export function adaptToolsForAnthropic(tools) {
    const out = {}
    const adapted = []
    for (const [name, definition] of Object.entries(tools || {})) {
        let schema = null
        try {
            schema = definition?.inputSchema ? asSchema(definition.inputSchema).jsonSchema : null
        } catch {
            schema = null
        }
        if (!hasUnsupportedTopLevelComposition(schema)) {
            out[name] = definition
            continue
        }
        const stripped = Object.fromEntries(Object.entries(schema).filter(([key]) => !ANTHROPIC_UNSUPPORTED_TOP_LEVEL_KEYS.includes(key)))
        const description = [definition.description, NOTE].filter(Boolean).join(' ')
        out[name] = { ...definition, description, inputSchema: jsonSchema(stripped) }
        adapted.push(name)
    }

    return { tools: out, adapted }
}
