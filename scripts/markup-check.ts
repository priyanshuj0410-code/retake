/**
 * `pnpm markup` (EVAL-18): the app draws the library's markup, decision by decision. For each of the First take's 40
 * decisions, the structure of the screen's top bar, body and dock in the app (every element's tag and classes, depth first) is compared
 * with the same decision in the signed-off demo (site/, the demo built by design-system/demo.py from the same script).
 * Text, attributes, the shuffled order of the cards and states that change under the finger (picked, held, filled)
 * are left out, so the check catches markup drifting from the library, not play. Run after the demo or the app
 * changes; part of pnpm check.
 */
import { cpSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { build } from 'vite'
import { record, summary } from './lib/check'
import { browserOpts, serve } from './lib/serve'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'out/markup-dist')
const PORT = 5323
const BASE = `http://localhost:${PORT}/`
const T = 'M the app draws the demo\'s markup for every decision'

await build({ root: ROOT, logLevel: 'silent', build: { outDir: DIST, emptyOutDir: true } })
cpSync(join(ROOT, 'site'), join(DIST, 'demo'), { recursive: true })
const server = await serve(DIST, PORT, ROOT)
const browser = await chromium.launch(browserOpts())
/** Each decision's screen in the app's flow, from the exported content. */
const STEPS = new Map(
  (JSON.parse(readFileSync(join(ROOT, 'content/take/first-take.json'), 'utf8')) as { flow: { type: string; id?: string }[] }).flow
    .flatMap((s, i) => (s.type === 'step' && s.id ? [[s.id, i] as const] : [])),
)

/** A body's structure: one line per element, its depth, tag and classes, sorted where siblings are shuffled. Sent to
 * the page as plain text: the test runner's helpers for named functions do not exist there. */
const WALK = `(sel) => {
  const STATES = /^(is-(selected|target|filled|armed|refused|wait|live|hover|latest)|has-more)$/
  const root = document.querySelector(sel)
  if (!root) return null
  function line(el) { return el.tagName.toLowerCase() + '.' + [...el.classList].filter((c) => !STATES.test(c)).sort().join('.') }
  function walk(el, depth) {
    if (el.tagName.toLowerCase() === 'svg') return ['  '.repeat(depth) + 'svg']
    const kids = [...el.children].map((k) => walk(k, depth + 1))
    // cards, rows and the tray come shuffled: compare them as a set
    if (el.matches('[data-shuffle], .tiles, .rows, .cr-tray')) kids.sort((a, b) => a.join().localeCompare(b.join()))
    return ['  '.repeat(depth) + line(el), ...kids.flat()]
  }
  return walk(root, 0)
}`
const skeleton = (page: Page, body: string) => page.evaluate(`(${WALK})(${JSON.stringify(body)})`) as Promise<string[] | null>

try {
  const demo = await browser.newPage({ viewport: { width: 412, height: 915 } })
  await demo.goto(`${BASE}demo/`)
  await demo.locator('.demo .phone').first().waitFor({ state: 'attached' })
  const ids = await demo.$$eval('.phone[data-ft]', (xs) => xs.map((x) => (x as HTMLElement).dataset.ft!))
  const app = await browser.newPage({ viewport: { width: 412, height: 915 } })
  await app.goto(BASE)
  const diffs: string[] = []
  let compared = 0
  for (const id of ids) {
    const parts = ['.topbar', '.scr-body', '.dock']
    const want = (await Promise.all(parts.map((k) => skeleton(demo, `.phone[data-ft="${id}"] .scr > ${k}`)))).flatMap((x) => x ?? ['missing'])
    const index = STEPS.get(id)
    if (index === undefined || !want) {
      diffs.push(`${id}: not found in ${index === undefined ? 'the app' : 'the demo'}`)
      continue
    }
    await app.evaluate((at) => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at, answers: {}, lang: 'mix', sound: false, birth: '1990-08-14' })), index)
    await app.reload()
    await app.locator('.take .app .scr-body').waitFor()
    const got = (await Promise.all(parts.map((k) => skeleton(app, `.take .app .page-play > ${k}`)))).flatMap((x) => x ?? ['missing'])
    compared++
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      const i = (got ?? []).findIndex((l, k) => l !== want[k])
      diffs.push(`${id}: line ${i}: demo "${want[i]?.trim()}", app "${got?.[i]?.trim()}"`)
    }
  }
  record(T, `all ${ids.length} decisions found in both`, ids.length === 40 && compared === 40, `${compared} compared`)
  record(T, "every decision's top bar, body and dock have the demo's structure", diffs.length === 0, diffs.slice(0, 6).join(' | '))
} catch (e) {
  record(T, 'threw', false, String(e))
} finally {
  await browser.close()
  server.close()
}
process.exit(summary() ? 0 : 1)
