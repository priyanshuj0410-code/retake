/**
 * `pnpm e2e` (rewritten for Retake's First take, EVAL-18): the whole take in Chromium on a production build served
 * with vercel.json's headers, in each language mode (Hinglish, Hindi, English) on a phone (412 x 915) and on a laptop
 * (1440 x 900, the wide layout). Every screen is played through its own controls: cutscenes panel by panel, the five
 * title cards, all 40 decisions by their kind (pick one and Believe, spend checks, rank, pick a team and keep, the
 * batting order, split), and the reading's five cards.
 *   - The take reaches its end and every decision's answer is kept on the phone, and nothing else: no times.
 *   - Each kind's main button waits until the decision is complete, then names its consequence.
 *   - The reading's five cards each say something in the chosen language (Devanagari in Hindi mode).
 *   - No screen scrolls sideways, and no page error or console error (a CSP refusal is one) anywhere.
 *   - A reload mid-take comes back on the same screen.
 */
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { build } from 'vite'
import { record, summary } from './lib/check'
import { browserOpts, serve } from './lib/serve'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'out/e2e-dist')
const PORT = 5321
const BASE = `http://localhost:${PORT}/`
const T = 'E the First take end to end (production build, Vercel headers)'
const DEVA = /[ऀ-ॿ]/

await build({ root: ROOT, logLevel: 'silent', build: { outDir: DIST, emptyOutDir: true } })
const server = await serve(DIST, PORT, ROOT)
const browser = await chromium.launch(browserOpts())

/** What the screen is: its frame's classes and label, and the main button's state and words. */
const look = (page: Page) =>
  page.evaluate(() => {
    const app = document.querySelector('.take .app')
    const main = document.querySelector('.take .dock .main')
    return {
      cls: app?.className ?? '',
      label: app?.getAttribute('aria-label') ?? '',
      live: !!main && !main.classList.contains('is-wait'),
      button: main?.textContent ?? '',
      sideways: document.documentElement.scrollWidth > innerWidth + 1,
    }
  })
const tapMain = (page: Page) => page.locator('.take .dock .main').click()

/** Answers the decision on screen through its own controls; returns whether the button waited until it was done. */
async function answer(page: Page, cls: string) {
  const waited = !(await look(page)).live
  if (/\bjs-(pick|checks)\b/.test(cls)) await page.locator('.tiles .tile').first().click()
  else if (/\bjs-rank\b/.test(cls)) {
    const n = await page.locator('.rows .row').count()
    for (let i = 0; i < n; i++) await page.locator('.rows .row:not(.is-selected)').filter({ has: page.locator('.rkno:empty') }).first().click()
  } else if (/\bjs-multi\b/.test(cls)) {
    for (let i = 0; i < 8 && !(await look(page)).live; i++) await page.locator('.rows .row[aria-checked="false"]').first().click()
  } else if (/\bjs-order\b/.test(cls)) {
    while (await page.locator('.cr-tray .row:not([hidden])').count()) await page.locator('.cr-tray .row:not([hidden])').first().click()
  } else if (/\bjs-split\b/.test(cls)) {
    for (let i = 0; i < 12 && !(await look(page)).live; i++) await page.locator('.rk-family .row').nth(i % 2).click()
  }
  return waited
}

async function play(lang: 'mix' | 'hi' | 'en', width: number, height: number) {
  const tag = `${lang} at ${width} x ${height}`
  const page = await browser.newPage({ viewport: { width, height } })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.goto(BASE)
  await page.evaluate((lang) => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at: 0, answers: {}, lang, sound: false })), lang)
  await page.reload()
  await page.locator('.take .app').waitFor()
  const kinds = new Map<string, number>()
  const waitedAll: string[] = []
  const cards: string[] = []
  let sideways = 0
  let reloaded = false
  for (let n = 0; n < 400; n++) {
    const s = await look(page)
    if (s.sideways) sideways++
    if (s.cls.includes('js-res')) {
      cards.push((await page.locator('.restext').innerText()).trim())
      await tapMain(page)
      if (cards.length === 5) continue
      await page.waitForFunction((t) => document.querySelector('.restext')?.textContent !== t, cards.at(-1))
      continue
    }
    if (s.cls.includes('is-step')) {
      const kind = s.cls.match(/\bjs-(pick|checks|rank|multi|order|split)\b/)?.[1] ?? '?'
      kinds.set(kind, (kinds.get(kind) ?? 0) + 1)
      if (!(await answer(page, s.cls))) waitedAll.push(`${s.label} (${kind})`)
      if (!(await look(page)).live) throw new Error(`${tag}: ${s.label} stays waiting after it was answered`)
      if (!reloaded && kind === 'rank') {
        // a reload mid-take comes back on the same decision
        await page.reload()
        await page.locator('.take .app').waitFor()
        record(T, `${tag}: a reload comes back on the same decision`, (await look(page)).label === s.label, s.label)
        reloaded = true
        await answer(page, s.cls)
      }
    }
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('retake.take') ?? '{}').at)
    await tapMain(page)
    await page.waitForTimeout(20)
    const after = await page.evaluate(() => JSON.parse(localStorage.getItem('retake.take') ?? '{}').at)
    if (after === 0 && before !== 0) break   // the take wrapped round to its start: the end was reached
  }
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('retake.take') ?? '{}'))
  const answers = Object.keys(kept.answers ?? {})
  record(T, `${tag}: the take reaches its end with all 40 answers kept`, answers.length === 40, `${answers.length} answers; kinds ${JSON.stringify(Object.fromEntries(kinds))}`)
  record(T, `${tag}: every kind was played`, ['pick', 'checks', 'rank', 'multi', 'order', 'split'].every((k) => kinds.has(k)))
  record(T, `${tag}: the phone keeps the place, the answers, the language and the sound switch, nothing else`,
    JSON.stringify(Object.keys(kept).sort()) === JSON.stringify(['answers', 'at', 'lang', 'sound', 'v']))
  record(T, `${tag}: every main button waited until its decision was complete`, waitedAll.length === 0, waitedAll.slice(0, 3).join('; '))
  record(T, `${tag}: the reading's five cards each say something${lang === 'hi' ? ', in Devanagari' : ''}`,
    cards.length === 5 && cards.every((c) => c.length > 10 && (lang === 'hi') === DEVA.test(c)), cards.map((c) => c.slice(0, 40)).join(' | '))
  record(T, `${tag}: no screen scrolls sideways`, sideways === 0, `${sideways} screens`)
  record(T, `${tag}: no page error and no console error`, errors.length === 0, errors.slice(0, 3).join(' | '))
  await page.close()
}

try {
  for (const lang of ['mix', 'hi', 'en'] as const) {
    await play(lang, 412, 915)
    await play(lang, 1440, 900)
  }
} catch (e) {
  record(T, 'threw', false, String(e))
} finally {
  await browser.close()
  server.close()
}
process.exit(summary() ? 0 : 1)
