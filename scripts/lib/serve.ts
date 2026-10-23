/**
 * A built site served the way Vercel serves it, for the checks: vercel.json's headers (the Content-Security-Policy
 * among them) and redirects, a 404 for anything missing, and no fallback to index.html (Vercel has none here: the app
 * is one page). Not a copy of Vercel: only what the checks need to catch a header or path that breaks the app.
 */
import { createServer, type Server } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

interface VercelConf {
  headers?: { source: string; headers: { key: string; value: string }[] }[]
  redirects?: { source: string; destination: string }[]
  rewrites?: { source: string; destination: string }[]
}

const pattern = (source: string) => new RegExp(`^${source.replace(/\(\.\*\)/g, '.*')}$`)

export interface ServeOpts {
  /** While it returns true, the page itself ('/' and '/index.html') is never answered: a stalled weak signal. */
  stall?: () => boolean
  /** Every path asked for, in order. */
  log?: string[]
}

export function serve(dir: string, port: number, root: string, opts: ServeOpts = {}): Promise<Server> {
  const conf = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as VercelConf
  const server = createServer((req, res) => {
    let path = decodeURIComponent((req.url ?? '/').split('?')[0])
    opts.log?.push(path)
    if (opts.stall?.() && (path === '/' || path === '/index.html')) return
    const to = conf.redirects?.find((r) => pattern(r.source).test(path))
    if (to) {
      res.writeHead(307, { location: to.destination })
      return res.end()
    }
    path = conf.rewrites?.find((r) => pattern(r.source).test(path))?.destination ?? path
    for (const h of conf.headers ?? [])
      if (pattern(h.source).test(path)) for (const { key, value } of h.headers) res.setHeader(key, value)
    let file = join(dir, path)
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file)) {
      res.writeHead(404)
      return res.end('not found')
    }
    res.setHeader('content-type', TYPES[extname(file)] ?? 'application/octet-stream')
    res.end(readFileSync(file))
  })
  return new Promise((r) => server.listen(port, () => r(server)))
}

/** Chromium for the checks: the one at CHROMIUM (in the cloud sessions, /opt/pw-browsers/chromium), else Chrome. */
export const browserOpts = () => (process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : { channel: 'chrome' as const })
