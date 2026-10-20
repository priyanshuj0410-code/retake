/**
 * The sample result report (EVAL-11, EVAL-12): plays one season on a running dev server (BASE,
 * POLICY as in scripts/season-play.ts, default notes then men first on equal descriptions),
 * exports the result page as an A4 PDF through Chromium's print (backgrounds printed, print
 * media, a footer on every page that says it is a sample) and, with SHOTS, screenshots the
 * result at each listed width.
 * Usage: BASE=http://localhost:5185/ PDF=knowledge/samples/sample-result-report.pdf \
 *        SHOTS=out/sample/result-{w}.png:390,1440 pnpm sample-pdf
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { chromium } from 'playwright-core'
import { playSeason } from './season-play'

const BASE = process.env.BASE ?? 'http://localhost:5184/'
const OUTS = (process.env.PDF ?? 'out/sample/sample-result-report.pdf').split(',')
const [shotPath, shotWidths] = (process.env.SHOTS ?? '').split(':')
const FOOT = 'Sample report from a prototype. Fictional colleagues; not a real result.'

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors: string[] = []
page.on('pageerror', (e) => errors.push(e.message))
try {
  await playSeason(page, BASE)
  await page.waitForSelector('[data-screen="story:result"]')
  mkdirSync('out/sample', { recursive: true })
  writeFileSync('out/sample/result.txt', await page.locator('main').innerText())
  for (const w of shotWidths ? shotWidths.split(',') : []) {
    await page.setViewportSize({ width: Number(w), height: 900 })
    await page.waitForTimeout(400)
    const path = shotPath.replace('{w}', w)
    mkdirSync(dirname(path), { recursive: true })
    await page.screenshot({ path, fullPage: true })
  }
  await page.setViewportSize({ width: 794, height: 1123 })
  await page.emulateMedia({ media: 'print' })
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')))
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(800)
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-family:sans-serif;font-size:9px;color:#544B3E;padding:0 15mm;display:flex;justify-content:space-between"><span>${FOOT}</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  })
  for (const o of OUTS) {
    mkdirSync(dirname(o), { recursive: true })
    writeFileSync(o, pdf)
  }
  console.log(JSON.stringify({ errors, bytes: pdf.length }))
} finally {
  await browser.close()
}
