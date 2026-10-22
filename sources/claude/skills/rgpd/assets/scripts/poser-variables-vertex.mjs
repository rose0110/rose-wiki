/**
 * Pose (ou remplace) les variables Vertex AI du projet Vercel de production
 * `smartdatapay-ai`, scopes Production ET Preview, valeurs CHIFFREES.
 *
 * Les valeurs ne sont lues QUE depuis un fichier JSON local non versionne
 * (chemin passe en argument), jamais depuis la ligne de commande ni un journal.
 * Format attendu du fichier :
 *   {
 *     "GOOGLE_VERTEX_PROJECT": "<id du projet GCP>",
 *     "GOOGLE_VERTEX_CLIENT_EMAIL": "<email du compte de service>",
 *     "GOOGLE_VERTEX_PRIVATE_KEY": "<cle privee PEM, \n echappes ou reels>",
 *     "GOOGLE_VERTEX_LOCATION": "europe-west1"
 *   }
 * (c'est le contenu du JSON de cle de compte de service : project_id,
 *  client_email, private_key — le script accepte aussi ce format brut).
 *
 * Usage : VERCEL_TOKEN=… node scripts/ia-europe/poser-variables-vertex.mjs <fichier.json> [--dry-run]
 * Apres la pose : supprimer le fichier local.
 */
import { readFileSync } from 'node:fs'

const TEAM = 'team_8TC9QayMpzN2Qcjerz3flrfS'
const PROJECT = 'prj_EZJrCIErLnwTATfU3eP5PMJp7O4Y' // smartdatapay-ai (prod) — jamais le projet homonyme dormant
const TARGETS = ['production', 'preview']
const KEYS = ['GOOGLE_VERTEX_PROJECT', 'GOOGLE_VERTEX_CLIENT_EMAIL', 'GOOGLE_VERTEX_PRIVATE_KEY', 'GOOGLE_VERTEX_LOCATION']

const [, , file, flag] = process.argv
const dryRun = flag === '--dry-run'
const token = [MASQUÉ]
if (!file) {
    console.error('Usage : node scripts/ia-europe/poser-variables-vertex.mjs <fichier.json> [--dry-run]')
    process.exit(2)
}
if (!token && !dryRun) {
    console.error('VERCEL_TOKEN requis')
    process.exit(2)
}

const raw = JSON.parse(readFileSync(file, 'utf8'))
const values = {
    GOOGLE_VERTEX_PROJECT: raw.GOOGLE_VERTEX_PROJECT || raw.project_id,
    GOOGLE_VERTEX_CLIENT_EMAIL: raw.GOOGLE_VERTEX_CLIENT_EMAIL || raw.client_email,
    // Vercel conserve la valeur telle quelle : on stocke les "\n" ECHAPPES, la
    // passerelle les deserialise (gateway-config.js).
    GOOGLE_VERTEX_PRIVATE_KEY: String(raw.GOOGLE_VERTEX_PRIVATE_KEY || raw.private_key || '').replace(/\r?\n/g, '\\n'),
    GOOGLE_VERTEX_LOCATION: raw.GOOGLE_VERTEX_LOCATION || 'europe-west1',
}
for (const key of KEYS) {
    if (!values[key]) {
        console.error(`Valeur manquante : ${key}`)
        process.exit(2)
    }
}
if (!/^europe-[a-z0-9]+$/.test(values.GOOGLE_VERTEX_LOCATION)) {
    console.error(`Region non europeenne refusee : ${values.GOOGLE_VERTEX_LOCATION}`)
    process.exit(2)
}

const api = async (path, init = {}) => {
    const res = await fetch(`https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}teamId=${TEAM}`, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(`${init.method || 'GET'} ${path} -> ${res.status} ${JSON.stringify(body).slice(0, 300)}`)
    return body
}

console.log(`Projet Vercel ${PROJECT}, scopes ${TARGETS.join(' + ')}, region ${values.GOOGLE_VERTEX_LOCATION}${dryRun ? ' (dry-run : rien n est envoye)' : ''}`)
if (dryRun) {
    for (const key of KEYS) console.log(`  ${key}: ${values[key].length} caracteres`)
    process.exit(0)
}

// Les variables existantes portant ces noms sont remplacees (upsert), jamais dupliquees.
const existing = (await api(`/v9/projects/${PROJECT}/env`)).envs || []
for (const key of KEYS) {
    const previous = existing.filter(e => e.key === key)
    for (const env of previous) {
        await api(`/v9/projects/${PROJECT}/env/${env.id}`, { method: 'DELETE' })
        console.log(`  ${key}: ancienne variable ${env.id} supprimee (${(env.target || []).join(',')})`)
    }
    const created = await api(`/v10/projects/${PROJECT}/env`, {
        method: 'POST',
        body: JSON.stringify({ key, value: values[key], type: 'encrypted', target: TARGETS }),
    })
    console.log(`  ${key}: posee (${created?.created?.id || 'id inconnu'}) sur ${TARGETS.join(' + ')}, chiffree`)
}
console.log('Termine. Supprimer maintenant le fichier local de valeurs.')
