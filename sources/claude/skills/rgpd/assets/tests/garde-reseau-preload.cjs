'use strict'

/**
 * Garde reseau « IA en Europe » — prechargeur Node (`--require`).
 *
 * Intercepte AVANT emission tous les transports sortants de Node (DNS, TCP,
 * TLS, HTTP/1, HTTP/2, fetch/undici) et :
 *   - journalise chaque cible dans IA_EUROPE_NETWORK_LOG (JSON par ligne :
 *     { transport, host, port, allowed }) ;
 *   - LEVE une erreur `IA_EUROPE_HOST_REFUSED` pour toute cible hors liste
 *     blanche europeenne. C'est lui qui mesure — pas un grep.
 *
 * Liste blanche par defaut :
 *   - `europe-<region>-aiplatform.googleapis.com` : inference Vertex AI en UE ;
 *   - `oauth2.googleapis.com` : echange du JWT du compte de service contre un
 *     jeton (authentification seule, aucune donnee metier) ;
 *   - localhost / 127.0.0.1 / ::1 : serveur local exerce par le test.
 * Surcharge possible par IA_EUROPE_ALLOWED_HOSTS (expressions regulieres
 * separees par des virgules), pour les tests negatifs.
 *
 * Modele : scripts/ccn/c08/external-ai-preload.cjs (garde financiere C08).
 */

const dns = require('node:dns')
const fs = require('node:fs')
const http = require('node:http')
const http2 = require('node:http2')
const https = require('node:https')
const net = require('node:net')
const tls = require('node:tls')

const DEFAULT_ALLOWED = [
    /^europe-[a-z0-9]+-aiplatform\.googleapis\.com$/,
    /^oauth2\.googleapis\.com$/,
]
const allowed = process.env.IA_EUROPE_ALLOWED_HOSTS
    ? process.env.IA_EUROPE_ALLOWED_HOSTS.split(',').map(s => new RegExp(s.trim()))
    : DEFAULT_ALLOWED
const logPath = process.env.IA_EUROPE_NETWORK_LOG || null
const resolvedAllowed = new Set() // adresses IP resolues pour des hotes autorises

function normalize(hostname) {
    return String(hostname ?? '')
        .trim()
        .toLowerCase()
        .replace(/^\[|\]$/g, '')
        .replace(/\.$/, '')
}

function isLocal(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0'
}

function record(transport, host, port, ok) {
    if (!logPath) return
    try {
        fs.appendFileSync(logPath, `${JSON.stringify({ pid: process.pid, transport, host, port: String(port ?? ''), allowed: ok })}\n`)
    } catch {
        // le journal est best-effort ; le refus, lui, est deja acquis
    }
}

function refused(transport, host, port) {
    record(transport, host, port, false)
    const error = new Error(`IA_EUROPE_HOST_REFUSED:${host || 'unknown'}`)
    error.code = 'IA_EUROPE_HOST_REFUSED'
    error.host = host
    error.transport = transport
    return error
}

function decide(hostname, transport, port = '') {
    const host = normalize(hostname)
    if (isLocal(host)) {
        record(transport, host, port, true)
        return
    }
    if (net.isIP(host) && resolvedAllowed.has(host)) {
        record(transport, host, port, true)
        return
    }
    if (allowed.some(re => re.test(host))) {
        record(transport, host, port, true)
        return
    }
    throw refused(transport, host, port)
}

function targetFromRequestArgs(args) {
    const first = args[0]
    if (first instanceof URL) return { hostname: first.hostname, port: first.port || (first.protocol === 'https:' ? '443' : '80') }
    if (typeof first === 'string') {
        try {
            const url = new URL(first)
            return { hostname: url.hostname, port: url.port || (url.protocol === 'https:' ? '443' : '80') }
        } catch {
            return { hostname: '', port: '' }
        }
    }
    if (first && typeof first === 'object') return { hostname: first.hostname ?? first.host ?? '', port: first.port ?? '' }
    return { hostname: '', port: '' }
}

function wrapRequest(original, transport) {
    return function guarded(...args) {
        const target = targetFromRequestArgs(args)
        decide(target.hostname, transport, target.port)
        return original.apply(this, args)
    }
}
http.request = wrapRequest(http.request, 'http.request')
http.get = wrapRequest(http.get, 'http.get')
https.request = wrapRequest(https.request, 'https.request')
https.get = wrapRequest(https.get, 'https.get')

if (typeof globalThis.fetch === 'function') {
    const originalFetch = globalThis.fetch
    globalThis.fetch = function guardedFetch(input, init) {
        const raw = typeof input === 'string' || input instanceof URL ? input : input?.url
        try {
            const url = raw ? new URL(raw) : null
            decide(url?.hostname ?? '', 'fetch', url?.port || (url?.protocol === 'https:' ? '443' : '80'))
        } catch (error) {
            return Promise.reject(error)
        }
        return originalFetch.call(this, input, init)
    }
}

function socketTarget(args) {
    const first = args[0]
    if (Array.isArray(first)) return socketTarget(first)
    if (typeof first === 'string' && !/^\d+$/.test(first)) return { hostname: '', ipc: true }
    if (typeof first === 'number') return { hostname: args[1] ?? 'localhost', port: first, ipc: false }
    if (!first || typeof first !== 'object') return { hostname: '', ipc: false }
    if (typeof first.path === 'string') return { hostname: '', ipc: true }
    return { hostname: first.host ?? first.hostname ?? first.servername ?? 'localhost', port: first.port ?? '', ipc: false }
}

function wrapSocketConnect(original, transport) {
    return function guardedConnect(...args) {
        const target = socketTarget(args)
        if (!target.ipc) decide(target.hostname, transport, target.port)
        return original.apply(this, args)
    }
}
net.Socket.prototype.connect = wrapSocketConnect(net.Socket.prototype.connect, 'net.Socket.connect')
tls.connect = wrapSocketConnect(tls.connect, 'tls.connect')

const originalHttp2Connect = http2.connect
http2.connect = function guardedHttp2Connect(authority, ...args) {
    let hostname = ''
    let port = ''
    try {
        const parsed = new URL(authority)
        hostname = parsed.hostname
        port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80')
    } catch {
        hostname = authority?.hostname ?? authority?.host ?? ''
        port = authority?.port ?? ''
    }
    decide(hostname, 'http2.connect', port)
    return originalHttp2Connect.call(this, authority, ...args)
}

// DNS : on decide sur le nom, et on memorise les adresses des hotes autorises
// pour que la connexion TCP qui suit (par IP) soit reconnue.
function rememberAddresses(result) {
    const list = Array.isArray(result) ? result : [result]
    for (const entry of list) {
        const address = typeof entry === 'string' ? entry : entry?.address
        if (address && net.isIP(address)) resolvedAllowed.add(address)
    }
}
const originalLookup = dns.lookup
dns.lookup = function guardedLookup(hostname, ...args) {
    decide(hostname, 'dns.lookup')
    const callbackIndex = args.findLastIndex(value => typeof value === 'function')
    if (callbackIndex >= 0) {
        const callback = args[callbackIndex]
        args[callbackIndex] = function remember(error, address, ...rest) {
            if (!error) rememberAddresses(address)
            return callback.call(this, error, address, ...rest)
        }
    }
    return originalLookup.call(this, hostname, ...args)
}
if (dns.promises?.lookup) {
    const originalPromiseLookup = dns.promises.lookup
    dns.promises.lookup = async function guardedPromiseLookup(hostname, ...args) {
        decide(hostname, 'dns.promises.lookup')
        const result = await originalPromiseLookup.call(this, hostname, ...args)
        rememberAddresses(result)
        return result
    }
}
for (const method of ['resolve', 'resolve4', 'resolve6', 'resolveAny', 'resolveCname']) {
    const original = dns[method]
    if (typeof original !== 'function') continue
    dns[method] = function guardedResolve(hostname, ...args) {
        decide(hostname, `dns.${method}`)
        return original.call(this, hostname, ...args)
    }
    const originalPromise = dns.promises?.[method]
    if (typeof originalPromise === 'function') {
        dns.promises[method] = async function guardedPromiseResolve(hostname, ...args) {
            decide(hostname, `dns.promises.${method}`)
            const result = await originalPromise.call(this, hostname, ...args)
            rememberAddresses(result)
            return result
        }
    }
}

module.exports = { decide, normalize }
