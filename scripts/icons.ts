/**
 * `pnpm icons`: draws the app icons in the Lugdi skin (EVAL-13) and writes them to
 * public/icons/. No face: the yellow price plate on the night ground with "EL" in Sarpanch, its
 * offset shadow in Lugdi red. The maskable icon keeps the art inside the central 60 per cent.
 * Colours are the tokens' values (src/styles/tokens.css): --lugdi-night, --lugdi-yellow,
 * --lugdi-red, --lugdi-ink; scripts/design-check.ts holds the manifest to them.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'public/icons')
const FONT = `file://${join(ROOT, 'public/fonts/sarpanch-latin-900-normal.woff2')}`

const art = (size: number, inset: number) => {
  const s = size
  const p = Math.round(s * inset)
  const w = s - 2 * p
  const shadow = Math.max(2, Math.round(s * 0.05))
  return `<!doctype html><html><head><style>
@font-face { font-family: 'SP'; src: url('${FONT}') format('woff2'); font-weight: 900; }
html, body { margin: 0; width: ${s}px; height: ${s}px; background: #1b0b2e; overflow: hidden; }
.plate { position: absolute; left: ${p}px; top: ${p}px; width: ${w - shadow}px; height: ${w - shadow}px;
  background: #ffd23f; box-shadow: ${shadow}px ${shadow}px 0 #e4002b; color: #111111;
  display: flex; align-items: center; justify-content: center;
  font: 900 ${Math.round(w * 0.46)}px/1 'SP', Impact, sans-serif; }
</style></head><body><div class="plate">EL</div></body></html>`
}

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ deviceScaleFactor: 1 })
const tmp = join(ROOT, 'out/icon.html')
mkdirSync(join(ROOT, 'out'), { recursive: true })
for (const [name, size, inset] of [
  ['icon-192.png', 192, 0.1],
  ['icon-512.png', 512, 0.1],
  ['icon-maskable-512.png', 512, 0.2],
  ['apple-touch-icon.png', 180, 0.14],
  ['favicon-32.png', 32, 0.04],
] as const) {
  writeFileSync(tmp, art(size, inset))
  await page.setViewportSize({ width: size, height: size })
  await page.goto(`file://${tmp}`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(OUT, name), omitBackground: false })
}
await browser.close()
console.log('icons ->', OUT)
