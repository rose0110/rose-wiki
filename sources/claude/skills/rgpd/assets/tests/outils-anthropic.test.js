/**
 * Correctif post-deploiement du 11/09/2026 (chantier « IA en Europe ») :
 *  1. Claude (Anthropic via Vertex) refuse un schema d'outil avec allOf/anyOf/oneOf au
 *     premier niveau → l'Agent Paie adapte les outils quand le modele est Claude ;
 *  2. le controle de paie filtre les lignes par categorie : chaque categorie emise par le
 *     moteur doit etre rattachee a un controle du catalogue (la ligne RGDU etait perdue).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { tool, jsonSchema, asSchema } from 'ai'
import { z } from 'zod'
import { adaptToolsForAnthropic, hasUnsupportedTopLevelComposition } from '../../src/library/ai/anthropic-tool-schema.js'

const ROOT = join(import.meta.dirname, '..', '..')

const outilConditionnel = tool({
    description: 'Maintien de salaire.',
    inputSchema: jsonSchema({
        type: 'object',
        properties: { mode: { type: 'string', enum: ['legal', 'conventionnel'] }, idcc: { type: 'string' } },
        required: ['mode'],
        allOf: [{ if: { properties: { mode: { const: 'conventionnel' } }, required: ['mode'] }, then: { required: ['idcc'] } }],
    }),
    execute: async args => ({ ok: true, args }),
})
const outilSimple = tool({
    description: 'Brut vers net.',
    inputSchema: z.object({ brut: z.number() }),
    execute: async ({ brut }) => ({ net: brut * 0.78 }),
})

test('un outil avec allOf au premier niveau est adapte pour Claude : composition retiree, execution conservee', async () => {
    const { tools, adapted } = adaptToolsForAnthropic({ calculMaintien: outilConditionnel, calculBrutNet: outilSimple })
    assert.deepEqual(adapted, ['calculMaintien'])
    const schema = asSchema(tools.calculMaintien.inputSchema).jsonSchema
    assert.equal(hasUnsupportedTopLevelComposition(schema), false)
    assert.deepEqual(schema.required, ['mode'])
    assert.ok(schema.properties.idcc, 'les proprietes sont conservees')
    assert.match(tools.calculMaintien.description, /verifiees a l execution/)
    assert.deepEqual(await tools.calculMaintien.execute({ mode: 'legal' }), { ok: true, args: { mode: 'legal' } })
})

test('un outil sans composition au premier niveau est renvoye tel quel (meme reference, validation zod conservee)', () => {
    const { tools, adapted } = adaptToolsForAnthropic({ calculBrutNet: outilSimple })
    assert.deepEqual(adapted, [])
    assert.equal(tools.calculBrutNet, outilSimple)
})

test("la route de l'Agent Paie adapte les outils quand le modele est Claude", () => {
    const route = readFileSync(join(ROOT, 'src/app/api/agent/events/route.js'), 'utf8')
    assert.match(route, /adaptToolsForAnthropic/)
    assert.match(route, /isClaude \? adaptToolsForAnthropic\(tools\)\.tools : tools/)
})

test('chaque categorie emise par le moteur de controle est rattachee a un controle du catalogue', () => {
    const route = readFileSync(join(ROOT, 'src/app/api/controles/executer/route.js'), 'utf8')
    const bloc = route.match(/const CATEGORIES_PAR_CONTROLE = \{([\s\S]*?)\n\}/)?.[1] || ''
    const mappees = new Set([...bloc.matchAll(/'([^']+)'/g)].map(m => m[1]).filter(v => !v.startsWith('controle-')))
    const sources = [
        join(ROOT, 'src/library/controles/moteur-bulletin.js'),
        ...readdirSync(join(ROOT, 'src/library/controles/competences')).map(f => join(ROOT, 'src/library/controles/competences', f)),
    ]
    const emises = new Set()
    for (const file of sources) for (const m of readFileSync(file, 'utf8').matchAll(/categorie: '([^']+)'/g)) emises.add(m[1])
    emises.delete('Coherence') // toujours active dans la route
    const orphelines = [...emises].filter(c => !mappees.has(c))
    assert.deepEqual(orphelines, [], `categories emises mais jamais affichees : ${orphelines.join(', ')}`)
    assert.ok(mappees.has('RGDU'), 'la ligne RGDU (ex-Fillon) doit remonter dans le controle Fillon')
})
