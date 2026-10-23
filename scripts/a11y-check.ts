/**
 * `pnpm a11y` (EVAL-18): axe-core (WCAG 2.2 A and AA rules) on every kind of screen in the First take, on a production
 * build served with vercel.json's headers, on a phone (412 x 915) and a laptop (1440 x 900), in Hinglish and Hindi:
 * the birth date, not yet 18, a cutscene, a title card, each of the six decision kinds, the reading, the "?" sheet,
 * Privacy and the Delete all dialog. Colour contrast over the paintings is left to the library's own pixel check
 * (DESIGN.md "Contrast floors"), since axe cannot read text over a picture; everything else must pass.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { build } from 'vite'
import { record, summary } from './lib/check'
import { browserOpts, serve } from './lib/serve'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'out/a11y-dist')
const PORT = 5322
const BASE = `http://localhost:${PORT}/`
const T = 'A accessibility (axe-core, WCAG 2.2 AA)'
const AXE = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8')

await build({ root: ROOT, logLevel: 'silent', build: { outDir: DIST, emptyOutDir: true } })
const server = await serve(DIST, PORT, ROOT)
const browser = await chromium.launch(browserOpts())

const flow = (JSON.parse(readFileSync(join(ROOT, 'content/take/first-take.json'), 'utf8')) as { flow: { type: string; kind?: string }[] }).flow
const first = (f: (s: { type: string; kind?: string }) => boolean) => flow.findIndex(f)
const SCREENS: [string, number | 'gate' | 'notyet', ((p: Page) => Promise<void>)?][] = [
  ['the birth date', 'gate'],
  ['not yet 18', 'notyet'],
  ['a cutscene', first((s) => s.type === 'cut')],
  ['a title card', first((s) => s.type === 'cover')],
  ...(['pick', 'checks', 'rank', 'team', 'order', 'split'] as const).map((k) => [`a decision: ${k}`, first((s) => s.kind === k)] as [string, number]),
  ['the reading', first((s) => s.type === 'results')],
  ['the "?" sheet', first((s) => s.kind === 'pick'), async (p) => p.locator('[data-help]').first().click()],
  ['Privacy', first((s) => s.kind === 'pick'), async (p) => {
    await p.locator('[data-help]').first().click()
    await p.locator('.sheetlinks button').click()
  }],
  ['the Delete all dialog', first((s) => s.kind === 'pick'), async (p) => {
    await p.locator('[data-help]').first().click()
    await p.locator('.sheetlinks button').click()
    await p.locator('.sheetlinks .is-danger').click()
  }],
]

async function audit(page: Page, name: string) {
  // the page's own CSP refuses inline scripts, which is right; axe goes in through the browser's evaluation instead
  await page.evaluate(`${AXE}\n;0`)
  const res = (await page.evaluate(() =>
    (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<unknown> } }).axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      rules: { 'color-contrast': { enabled: false } },
    }),
  )) as { violations: { id: string; impact: string; nodes: { target: string[] }[] }[]; passes: unknown[] }
  // a run that checked nothing would pass silently: each screen must have had rules applied
  if (res.passes.length < 5) return [`${name}: axe applied only ${res.passes.length} rules`]
  return res.violations.map((v) => `${name}: ${v.id} (${v.impact}) at ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(', ')}`)
}

try {
  for (const [w, h] of [[412, 915], [1440, 900]]) {
    for (const lang of ['mix', 'hi'] as const) {
      const found: string[] = []
      for (const [name, at, open] of SCREENS) {
        const page = await browser.newPage({ viewport: { width: w, height: h } })
        await page.goto(BASE)
        const saved =
          at === 'gate' ? null
          : at === 'notyet' ? { v: 1, at: 0, answers: {}, lang, sound: false, opens: '2099-01-01' }
          : { v: 1, at, answers: {}, lang, sound: false, birth: '1990-08-14' }
        await page.evaluate((s) => (s ? localStorage.setItem('retake.take', JSON.stringify(s)) : localStorage.removeItem('retake.take')), saved)
        await page.reload()
        await page.locator('.take .app').waitFor()
        if (at === 'gate' && lang === 'hi') await page.locator('.langchips [lang="hi"]').click()
        if (open) await open(page)
        await page.waitForTimeout(300)
        found.push(...(await audit(page, name)))
        await page.close()
      }
      record(T, `${lang} at ${w} x ${h}: no violation on any screen`, found.length === 0, found.slice(0, 6).join(' | '))
    }
  }
} catch (e) {
  record(T, 'threw', false, String(e))
} finally {
  await browser.close()
  server.close()
}
process.exit(summary() ? 0 : 1)
