/**
 * The built app contacts no third party (feature-set F-122b): the library's styles, fonts and pictures are self
 * hosted under /take/, there is no analytics and no remote store; and its script stays light for a 2 GB phone on a
 * weak signal (P4). Builds into node_modules/.tmp and reads every emitted script, stylesheet and page.
 */
import { readFileSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'
import { record } from './lib/check'

const T = 'B the built app'
const ROOT = new URL('..', import.meta.url).pathname
/** gzipped, for the app's own script (the First take's content rides in it) */
const SCRIPT_BUDGET = 130_000

export async function run() {
  const out = join(ROOT, 'node_modules/.tmp/bundle-check')
  await build({ root: ROOT, logLevel: 'silent', build: { outDir: out, emptyOutDir: true } })
  const read = (dir: string, re: RegExp) =>
    readdirSync(join(out, dir), { recursive: true })
      .map(String)
      .filter((f) => re.test(f))
      .map((f) => readFileSync(join(out, dir, f), 'utf8'))
  const scripts = read('assets', /\.js$/)
  const styles = [...read('assets', /\.css$/), ...read('take', /\.css$/)]
  const code = [...scripts, ...styles, readFileSync(join(out, 'index.html'), 'utf8'), readFileSync(join(out, 'sw.js'), 'utf8')].join('\n')
  const remote = [...code.matchAll(/(?:url\(|src=|href=|fetch\(|import\()\s*['"]?(https?:\/\/[^'")\s]+)/g)].map((m) => m[1])
  record(T, 'nothing is loaded from another origin (fonts, art, scripts)', remote.length === 0, remote.slice(0, 4).join(', '))
  record(T, 'no Google Fonts, analytics or Firebase in the build', !/fonts\.googleapis|gstatic|google-analytics|gtag\(|firebaseio|firebase\.google/.test(code))
  const fontUrls = [...styles.join('\n').matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => m[1].replace(/['"]/g, ''))
  record(T, 'every font face is self hosted under /take/fonts/', fontUrls.length >= 20 && fontUrls.every((u) => u.startsWith('fonts/')), `${fontUrls.length} faces`)
  const gz = scripts.reduce((n, s) => n + gzipSync(s).length, 0)
  record(T, `the app's script stays under ${SCRIPT_BUDGET / 1000} KB gzipped`, gz < SCRIPT_BUDGET, `${Math.round(gz / 1000)} KB`)
  rmSync(out, { recursive: true, force: true })
}
