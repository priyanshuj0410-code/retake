/**
 * `pnpm icons`: draws the app icons in the comic register (EVAL-7) and writes them to
 * public/icons/. No face: a square ink-ruled panel on caption yellow holding the violet round
 * stamp tilted 8 degrees, "TS" in the display face. The maskable icon keeps the art inside the
 * central 60 per cent (the safe zone is a circle of 80 per cent), on a full-bleed ground.
 * Colours are the tokens' values (src/styles/tokens.css): --comic-caption, --comic-paper,
 * --comic-ink, --violet, --white; scripts/design-check.ts holds the manifest to them.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'public/icons')
const FONT = `file://${join(ROOT, 'public/fonts/big-shoulders-display-800.woff2')}`

const art = (size: number, inset: number) => {
  const s = size
  const p = Math.round(s * inset)
  const w = s - 2 * p
  const line = Math.max(2, Math.round(s * 0.025))
  const shadow = Math.max(2, Math.round(s * 0.03))
  const stamp = Math.round(w * 0.62)
  return `<!doctype html><html><head><style>
@font-face { font-family: 'BSD'; src: url('${FONT}') format('woff2'); font-weight: 800; }
html, body { margin: 0; width: ${s}px; height: ${s}px; background: #ffe27a; overflow: hidden; }
.panel { position: absolute; left: ${p}px; top: ${p}px; width: ${w - line * 2 - shadow}px; height: ${w - line * 2 - shadow}px;
  background: #ffffff; border: ${line}px solid #121212; box-shadow: ${shadow}px ${shadow}px 0 #121212;
  display: flex; align-items: center; justify-content: center; }
.stamp { width: ${stamp}px; height: ${stamp}px; border-radius: 50%; background: #553286; color: #ffffff;
  transform: rotate(-8deg); display: flex; align-items: center; justify-content: center;
  font: 800 ${Math.round(stamp * 0.5)}px/1 'BSD', Impact, sans-serif; letter-spacing: 0.02em; }
</style></head><body><div class="panel"><div class="stamp">TS</div></div></body></html>`
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
