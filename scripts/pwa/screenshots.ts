/**
 * `pnpm pwa:screens`: the manifest's screenshots, which Android shows in its install dialog (Chrome's richer install
 * sheet). Shot from a production build of the app itself at a 412 px phone at its own pixels (Chrome fetches these on
 * every visit to an installable page, so they are kept small: about 60 KB each): the opening cutscene, a decision with
 * a pick, and the same decision in Hindi. Written to public/screenshots/ as JPEG; the manifest lists them.
 * Re-run after the First take's look changes.
 */
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { build } from 'vite'
import { passGate } from '../lib/gate'
import { browserOpts, serve } from '../lib/serve'

const ROOT = new URL('../..', import.meta.url).pathname
const DIST = join(ROOT, 'out/shots-dist')
const OUT = join(ROOT, 'public/screenshots')
const PORT = 5198
const FIRST_PICK = (JSON.parse(readFileSync(join(ROOT, 'content/take/first-take.json'), 'utf8')).flow as { type: string; kind?: string }[]).findIndex(
  (s) => s.type === 'step' && s.kind === 'pick',
)

await build({ root: ROOT, logLevel: 'silent', build: { outDir: DIST, emptyOutDir: true } })
const server = await serve(DIST, PORT, ROOT)
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch(browserOpts())
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, hasTouch: true })
const shot = (name: string) => page.screenshot({ path: join(OUT, name), type: 'jpeg', quality: 72 })
try {
  await page.goto(`http://localhost:${PORT}/`)
  await passGate(page)
  await page.locator('.cutpanel img').first().waitFor()
  await page.waitForTimeout(600)
  await shot('opening.jpg')
  // straight to the first pick-one decision: the First take's first decisions are of other kinds, whose button waits
  await page.evaluate((at) => {
    const t = JSON.parse(localStorage.getItem('retake.take') ?? '{}')
    localStorage.setItem('retake.take', JSON.stringify({ ...t, at }))
  }, FIRST_PICK)
  await page.reload()
  await page.locator('.tiles').waitFor()
  await page.waitForTimeout(500)
  await page.click('.tiles .tile >> nth=1')
  await page.waitForTimeout(300)
  await shot('decision.jpg')
  await page.click('[data-help]')
  await page.click('[data-set-lang="hi"]')
  await page.click('.helpsheet .close')
  await page.waitForTimeout(400)
  await shot('decision-hindi.jpg')
} finally {
  await browser.close()
  server.close()
}
console.log('screenshots ->', OUT)
