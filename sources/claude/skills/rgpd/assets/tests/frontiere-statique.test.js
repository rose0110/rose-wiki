/**
 * Frontiere statique « IA en Europe » — sans reseau.
 *
 * Aucun fichier de `src/` hors `src/library/ai/gateway.js` n'importe un
 * fournisseur d'IA ni ne contient un hote de fournisseur. Liste blanche
 * FERMEE : la seule exception est la passerelle. Un fichier qui contourne la
 * passerelle ne passe pas la CI.
 *
 * Analyse statique = detection de motifs dans les sources. Ce test ne mesure
 * pas le reseau : c'est le role de `garde-reseau.test.mjs`.
 */

import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import test from 'node:test'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const GATEWAY = 'src/library/ai/gateway.js'
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'])

const PROVIDER_PACKAGES = [
    '@ai-sdk/google',
    '@ai-sdk/anthropic',
    '@ai-sdk/openai',
    '@ai-sdk/google-vertex',
    '@ai-sdk/perplexity',
    '@ai-sdk/mistral',
    '@ai-sdk/deepseek',
    '@ai-sdk/xai',
    '@ai-sdk/amazon-bedrock',
    '@anthropic-ai/sdk',
    '@google/generative-ai',
    '@google/genai',
    '@google-cloud/vertexai',
    'openai',
    'google-auth-library',
]

const PROVIDER_HOSTS = [
    'api.anthropic.com',
    'generativelanguage.googleapis.com',
    'api.openai.com',
    'api.perplexity.ai',
    'api.tavily.com',
    'api.mistral.ai',
    'api.deepseek.com',
    'openrouter.ai',
    'ai-gateway.vercel.sh',
    'bedrock-runtime',
]

function listSourceFiles(directory) {
    const out = []
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const full = join(directory, entry.name)
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.next') continue
            out.push(...listSourceFiles(full))
        } else if (EXTENSIONS.has(full.slice(full.lastIndexOf('.')))) {
            out.push(full)
        }
    }
    return out
}

function importSpecifiers(source) {
    const found = []
    // import … from 'x' | import 'x' | export … from 'x'
    for (const match of source.matchAll(/\b(?:import|export)\b[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/g)) found.push(match[1])
    for (const match of source.matchAll(/\bimport\s*['"]([^'"]+)['"]/g)) found.push(match[1])
    // import('x') | require('x')
    for (const match of source.matchAll(/\b(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) found.push(match[1])
    return found
}

function isProviderSpecifier(specifier) {
    return PROVIDER_PACKAGES.some(pkg => specifier === pkg || specifier.startsWith(`${pkg}/`))
}

const files = listSourceFiles(SRC).map(full => ({
    full,
    rel: relative(ROOT, full).split(sep).join('/'),
    source: readFileSync(full, 'utf8'),
}))

test('le corpus analyse est non vide et contient la passerelle', () => {
    assert.ok(files.length > 100, `seulement ${files.length} fichiers sous src/`)
    assert.ok(files.some(f => f.rel === GATEWAY), 'passerelle absente')
    assert.ok(statSync(join(ROOT, GATEWAY)).size > 0)
})

test('aucun fichier de src/ hors la passerelle n importe un fournisseur d IA', () => {
    const offenders = []
    for (const file of files) {
        if (file.rel === GATEWAY) continue
        const bad = importSpecifiers(file.source).filter(isProviderSpecifier)
        if (bad.length) offenders.push(`${file.rel} -> ${[...new Set(bad)].join(', ')}`)
    }
    assert.deepEqual(offenders, [], `imports directs de fournisseur :\n${offenders.join('\n')}`)
})

test('aucun fichier de src/ ne contient un hote de fournisseur d IA (passerelle comprise)', () => {
    const offenders = []
    for (const file of files) {
        const bad = PROVIDER_HOSTS.filter(host => file.source.includes(host))
        if (bad.length) offenders.push(`${file.rel} -> ${bad.join(', ')}`)
    }
    assert.deepEqual(offenders, [], `hotes de fournisseur :\n${offenders.join('\n')}`)
})

test('la passerelle n importe que Vertex (Google + Anthropic sur Vertex) et l authentification Google', () => {
    const gateway = files.find(f => f.rel === GATEWAY)
    const providers = [...new Set(importSpecifiers(gateway.source).filter(isProviderSpecifier))].sort()
    assert.deepEqual(providers, ['@ai-sdk/google-vertex', '@ai-sdk/google-vertex/anthropic', 'google-auth-library'])
})

test('la passerelle ne connait aucun hote global ni multi-region : seulement europe-*', () => {
    const gateway = files.find(f => f.rel === GATEWAY)
    assert.doesNotMatch(gateway.source, /['"`]https:\/\/aiplatform\.googleapis\.com/, 'terminal global interdit')
    assert.doesNotMatch(gateway.source, /rep\.googleapis\.com/, 'terminal multi-region non retenu')
    assert.doesNotMatch(gateway.source, /location:\s*['"](?:us|global)/, 'region non europeenne')
})

test('la passerelle est le seul fichier a construire un fournisseur (createVertex*)', () => {
    const offenders = files
        .filter(f => f.rel !== GATEWAY && /\bcreateVertex(?:Anthropic)?\s*\(/.test(f.source))
        .map(f => f.rel)
    assert.deepEqual(offenders, [])
})

test('le pont CLI Claude (src/library/cdtn/claude-cli.mjs) n a aucun importeur et personne d autre ne lance le CLI claude', () => {
    // Ce fichier lance le CLI `claude` par spawn (sortie IA hors passerelle,
    // invisible pour la regle des imports). Il est en quarantaine (preflight C09)
    // et ne doit etre rebranche par aucun fichier de src/.
    const BRIDGE = 'src/library/cdtn/claude-cli.mjs'
    const offenders = []
    for (const file of files) {
        if (file.rel === BRIDGE) continue
        if (importSpecifiers(file.source).some(s => /(^|\/)cdtn\/claude-cli(\.mjs)?$/.test(s))) offenders.push(`${file.rel} -> importe le pont CLI Claude`)
        if (/\bspawn(?:Sync)?\(\s*['"`]claude['"`]/.test(file.source)) offenders.push(`${file.rel} -> lance le CLI claude`)
    }
    assert.deepEqual(offenders, [])
})

test('les anciens points de sortie directs ont disparu', () => {
    for (const rel of ['src/hooks/use-server.js', 'src/hooks/useUpdateNews.js', 'src/library/ai.js']) {
        assert.ok(!files.some(f => f.rel === rel), `${rel} devrait etre supprime`)
    }
})
