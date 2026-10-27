/**
 * `pnpm icons`: draws the app's PNG icons and its link-preview image into public/icons/ from the ticket icon
 * (DESIGN.md's default A, "the day's ticket": one icon for every world), which design-system/tools/app_content.py
 * writes as public/icons/retake.svg and retake-maskable.svg from library.py's icon_svg. Run the export first.
 *
 * The link preview (og.png, 1200 x 630) is a stand-in until the library draws SC-71: the ticket and the name in
 * English and Hindi on the icon's night ground, in the self-hosted Sarpanch and Hind.
 *
 * Chromium: playwright-core's own, or the one at CHROMIUM (in the cloud sessions, /opt/pw-browsers/chromium).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'public/icons')
const TAKE = `file://${join(ROOT, 'public/take')}`
const svg = (name: string) => readFileSync(join(OUT, name), 'utf8')

const square = (art: string, size: number) => `<!doctype html><html><head><style>
html, body { margin: 0; width: ${size}px; height: ${size}px; overflow: hidden; }
svg { display: block; width: ${size}px; height: ${size}px; }
</style></head><body>${art}</body></html>`

const preview = `<!doctype html><html><head>
<link rel="stylesheet" href="${TAKE}/fonts.css"><link rel="stylesheet" href="${TAKE}/display-fonts.css">
<style>
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #1B0B2E; }
body { display: flex; align-items: center; gap: 64px; padding: 0 96px; box-sizing: border-box; color: #E9DFC4; }
svg { width: 300px; height: 300px; flex: none; border-radius: 48px; }
h1 { margin: 0; font: 900 156px/1 'Sarpanch', sans-serif; letter-spacing: 1px; }
p { margin: 20px 0 0; font: 500 44px/1.3 'Hind', sans-serif; }
p span { font-size: 40px; opacity: .8; }
</style></head><body>${svg('retake.svg')}<div><h1>Retake</h1><p>A fairness puzzle<br><span lang="hi">रीटेक</span></p></div></body></html>`

const ICONS: [name: string, size: number, art: string][] = [
  ['icon-192.png', 192, 'retake.svg'],
  ['icon-512.png', 512, 'retake.svg'],
  ['icon-maskable-512.png', 512, 'retake-maskable.svg'],
  ['apple-touch-icon.png', 180, 'retake.svg'],
  ['favicon-32.png', 32, 'retake.svg'],
]

mkdirSync(join(ROOT, 'out'), { recursive: true })
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const [name, size, art] of ICONS) {
  const tmp = join(ROOT, 'out/icon.html')
  writeFileSync(tmp, square(svg(art), size))
  await page.setViewportSize({ width: size, height: size })
  await page.goto(`file://${tmp}`)
  await page.screenshot({ path: join(OUT, name) })
}
const tmp = join(ROOT, 'out/og.html')
writeFileSync(tmp, preview)
await page.setViewportSize({ width: 1200, height: 630 })
await page.goto(`file://${tmp}`)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: join(OUT, 'og.png') })
await browser.close()
console.log('icons and og.png ->', OUT)
