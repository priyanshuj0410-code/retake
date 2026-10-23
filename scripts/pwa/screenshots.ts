/**
 * `pnpm pwa:screens`: the manifest's screenshots, which Android shows in its install dialog (Chrome's richer install
 * sheet). Shot from a production build of the app itself at a 412 px phone, twice the pixels: the opening cutscene, a
 * decision with a pick, and the same decision in Hindi. Written to public/screenshots/ as JPEG; the manifest lists them.
 * Re-run after the First take's look changes.
 */
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { build } from 'vite'
import { browserOpts, serve } from '../lib/serve'

const ROOT = new URL('../..', import.meta.url).pathname
const DIST = join(ROOT, 'out/shots-dist')
const OUT = join(ROOT, 'public/screenshots')
const PORT = 5198

await build({ root: ROOT, logLevel: 'silent', build: { outDir: DIST, emptyOutDir: true } })
const server = await serve(DIST, PORT, ROOT)
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch(browserOpts())
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, hasTouch: true })
const shot = (name: string) => page.screenshot({ path: join(OUT, name), type: 'jpeg', quality: 82 })
try {
  await page.goto(`http://localhost:${PORT}/`)
  await page.locator('.cutpanel img').first().waitFor()
  await page.waitForTimeout(600)
  await shot('opening.jpg')
  for (let i = 0; i < 40 && !(await page.$('.tiles')); i++) {
    await page.click('.dock .main')
    await page.waitForTimeout(120)
  }
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
