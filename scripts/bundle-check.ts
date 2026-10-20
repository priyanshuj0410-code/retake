/**
 * The built app contacts no third party: fonts and art are self hosted, there is no analytics
 * and no remote store. Builds into node_modules/.tmp and reads every emitted file.
 */
import { readFileSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { build } from 'vite'
import { record } from './lib/check'

const T = 'B the built app'
const ROOT = new URL('..', import.meta.url).pathname

export async function run() {
  const out = join(ROOT, 'node_modules/.tmp/bundle-check')
  await build({ root: ROOT, logLevel: 'silent', build: { outDir: out, emptyOutDir: true } })
  const assets = readdirSync(join(out, 'assets'))
  const code = assets.filter((f) => /\.(js|css)$/.test(f)).map((f) => readFileSync(join(out, 'assets', f), 'utf8')).join('\n') + readFileSync(join(out, 'index.html'), 'utf8')
  const remote = [...code.matchAll(/(?:url\(|src=|href=|fetch\(|import\()\s*['"]?(https?:\/\/[^'")\s]+)/g)].map((m) => m[1])
  record(T, 'nothing is loaded from another origin (fonts, art, scripts)', remote.length === 0, remote.slice(0, 4).join(', '))
  record(T, 'no Google Fonts, analytics or Firebase in the bundle', !/fonts\.googleapis|gstatic|google-analytics|gtag\(|firebaseio|firebase\.google/.test(code))
  const fontUrls = [...code.matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => m[1])
  record(T, 'every font face is self hosted under /fonts/', fontUrls.length >= 20 && fontUrls.every((u) => u.replace(/['"]/g, '').startsWith('/fonts/')), `${fontUrls.length} faces`)
  rmSync(out, { recursive: true, force: true })
}
