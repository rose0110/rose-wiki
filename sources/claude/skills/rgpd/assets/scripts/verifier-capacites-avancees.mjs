/**
 * Verifie, avec la VRAIE cle (fichier .env tire par `vercel env pull`), les
 * capacites que la verification de base n'exerce pas et que le verdict QA du
 * 11/09/2026 a signalees comme non prouvees :
 *   - embedMany a 50 valeurs (lot d'indexation des documents de l'Agent Paie) ;
 *   - recherche web ancree : presence de sources, pas seulement du texte ;
 *   - Claude Sonnet via Vertex AVEC outil, cacheControl et thinking (chemin de
 *     l'Agent Paie en mode claude) ;
 *   - Gemini 2.5 Pro avec outil.
 * N'affiche que statut, tailles, hote, modele, duree — jamais la cle ni le contenu.
 *
 * Usage : SDP_VERTEX_ENV_FILE=<fichier.env> node scripts/ia-europe/verifier-capacites-avancees.mjs [sortie.json]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { embedMany, generateText, tool } from 'ai'
import { z } from 'zod'

const envFile = process.env.SDP_VERTEX_ENV_FILE
if (!envFile) throw new Error('SDP_VERTEX_ENV_FILE requis')
for (const rawLine of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const key = line.slice(0, line.indexOf('=')).trim()
    if (!key.startsWith('GOOGLE_VERTEX_')) continue
    let value = line.slice(line.indexOf('=') + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    process.env[key] = value.replace(/\n/g, '\n')
}
process.env.VERCEL = ''
process.env.VERCEL_ENV = 'development'
delete process.env.AI_GATEWAY_TEST_ACCESS_TOKEN

const { createAiGateway, AI_MODELS } = await import('../../src/library/ai/gateway.js')
const traces = []
const gw = createAiGateway({ onTrace: t => traces.push(t) })

const outilBrutNet = tool({
    description: 'Calcule le net a partir du brut.',
    inputSchema: z.object({ brut: z.number().describe('Salaire brut mensuel en euros') }),
    execute: async ({ brut }) => ({ brut, net: Math.round(brut * 0.78 * 100) / 100 }),
})

const steps = {
    'embedMany-50': async () => {
        const values = Array.from({ length: 50 }, (_, i) => `Article ${i + 1} du contrat de travail : le salarie exerce ses fonctions au siege.`)
        const { embeddings } = await embedMany({ model: gw.embeddingModel(), values, providerOptions: gw.embedProviderOptions(768) })

        return { count: embeddings.length, dim: embeddings[0]?.length }
    },
    'recherche-sources': async () => {
        const r = await generateText({
            model: gw.languageModel(AI_MODELS.TEXT_FAST),
            tools: { enterprise_web_search: gw.webSearchTool() },
            prompt: 'Quel est le montant du SMIC horaire brut en France aujourd hui ? Une phrase avec la source.',
        })
        const urls = (r.sources || []).filter(s => s.sourceType === 'url').map(s => { try { return new URL(s.url).hostname } catch { return 'url-invalide' } })

        return { textLength: r.text.length, sources: r.sources?.length ?? 0, hotesDesSources: [...new Set(urls)].slice(0, 8) }
    },
    'claude-outil-cache-thinking': async () => {
        const r = await generateText({
            model: gw.languageModel(AI_MODELS.CLAUDE_SONNET),
            system: 'Tu es un assistant paie. Utilise l outil pour tout calcul.',
            tools: { calculBrutNet: outilBrutNet },
            prompt: 'Quel est le net pour 2800 euros brut ?',
            providerOptions: { anthropic: { thinking: { type: 'enabled', budgetTokens: [MASQUÉ] } } },
        })
        const calls = r.steps.flatMap(s => s.toolCalls || [])

        return { toolCalls: calls.length, premierInput: calls[0]?.input, textLength: r.text.length }
    },
    'gemini-pro-outil': async () => {
        const r = await generateText({
            model: gw.languageModel(AI_MODELS.TEXT_PRO),
            tools: { calculBrutNet: outilBrutNet },
            prompt: 'Quel est le net pour 2800 euros brut ? Utilise l outil.',
        })
        const calls = r.steps.flatMap(s => s.toolCalls || [])

        return { toolCalls: calls.length, premierInput: calls[0]?.input, textLength: r.text.length }
    },
}

const results = {}
for (const [name, run] of Object.entries(steps)) {
    const t0 = Date.now()
    try {
        results[name] = { ok: true, ms: Date.now() - t0, ...(await run()) }
        results[name].ms = Date.now() - t0
    } catch (error) {
        const body = String(error?.responseBody || '')
        results[name] = {
            ok: false, ms: Date.now() - t0,
            code: error?.code || error?.name || 'ERREUR',
            status: error?.status ?? error?.statusCode ?? error?.cause?.status ?? null,
            // message du fournisseur tronque, sans identifiants (diagnostic local uniquement)
            fournisseur: body.match(/"message":\s*"([^"]{0,200})/)?.[1]?.replace(/projects\/[^/]+/g, 'projects/…') || null,
        }
    }
}

const out = { at: new Date().toISOString(), location: process.env.GOOGLE_VERTEX_LOCATION, results, traces }
console.log(JSON.stringify(out, null, 2))
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(out, null, 2))
const hosts = [...new Set(traces.map(t => t.host))]
process.exit(Object.values(results).every(r => r.ok) && hosts.every(h => /^europe-[a-z0-9]+-aiplatform\.googleapis\.com$/.test(h)) ? 0 : 1)
