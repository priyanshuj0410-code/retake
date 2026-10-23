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
  await page.evaluate((lang) => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at: 0, answers: {}, lang, sound: false, birth: '1990-08-14' })), lang)
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
  record(T, `${tag}: the phone keeps the place, the answers, the language, the sound switch and the birth date, nothing else`,
    JSON.stringify(Object.keys(kept).sort()) === JSON.stringify(['answers', 'at', 'birth', 'lang', 'sound', 'v']))
  record(T, `${tag}: every main button waited until its decision was complete`, waitedAll.length === 0, waitedAll.slice(0, 3).join('; '))
  record(T, `${tag}: the reading's five cards each say something${lang === 'hi' ? ', in Devanagari' : ''}`,
    cards.length === 5 && cards.every((c) => c.length > 10 && (lang === 'hi') === DEVA.test(c)), cards.map((c) => c.slice(0, 40)).join(' | '))
  record(T, `${tag}: no screen scrolls sideways`, sideways === 0, `${sideways} screens`)
  record(T, `${tag}: no page error and no console error`, errors.length === 0, errors.slice(0, 3).join(' | '))
  await page.close()
}

/** The first visit (SC-15, SC-16): what each answer does, and what it leaves on the phone. */
async function gate() {
  const g = 'E the first visit: the birth date and not yet 18'
  const page = await browser.newPage({ viewport: { width: 360, height: 640 } })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  const kept = () => page.evaluate(() => JSON.parse(localStorage.getItem('retake.take') ?? 'null'))
  const fill = async (d: string, m: string, y: string) => {
    for (const [i, v] of [d, m, y].entries()) await page.locator('.datefields input').nth(i).fill(v)
  }
  const hint = () => page.locator('.gatehint').innerText()
  await page.goto(BASE)
  record(g, 'a first visit opens on the birth date, before anything else', (await page.locator('.datefields input').count()) === 3 && (await page.locator('.cutpanel').count()) === 0)
  record(g, 'the button says what is missing and waits', !(await look(page)).live && /birth date/i.test((await look(page)).button))
  await fill('31', '02', '1990')
  record(g, 'not a real date: one line in place, the digits kept, the button still waits',
    /does not exist/.test(await hint()) && (await page.locator('.datefields input').nth(0).inputValue()) === '31' && !(await look(page)).live)
  await fill('01', '01', '2999')
  record(g, 'a date still to come is refused', /still to come/.test(await hint()) && !(await look(page)).live)
  await fill('12', '3', '1956')
  record(g, 'a real date shows in words under the fields', (await page.locator('.datewords').innerText()).trim() === '12 March 1956' && (await look(page)).live)
  // under 18: three years ago today, give or take
  const y = String(new Date().getUTCFullYear() - 3)
  await fill('01', '06', y)
  await page.locator('.take .dock .main').click()
  const minor = await kept()
  record(g, 'under 18: the day count, and the phone keeps only the day the game opens',
    /You can play in [\d,]+ days/.test(await page.locator('.gatecard .q').innerText()) && !minor.birth && /^\d{4}-06-01$/.test(minor.opens))
  await page.reload()
  record(g, 'under 18 stays shut on every later open', (await page.locator('.gatecard .q').count()) === 1 && (await page.locator('.datefields').count()) === 0)
  await page.locator('.gatecard .textbtn').click()
  await fill('01', '06', y)
  await page.locator('.take .dock .main').click()
  record(g, '"Wrong date?" is offered once: a second answer under 18 comes back without it', (await page.locator('.gatecard .textbtn').count()) === 0)
  await page.evaluate(() => localStorage.removeItem('retake.take'))
  await page.reload()
  await fill('14', '08', '1990')
  await page.locator('.take .dock .main').click()
  await page.locator('.cutpanel').first().waitFor()
  const adult = await kept()
  record(g, '18 or older: the take opens, and the phone keeps the birth date', adult.birth === '1990-08-14' && !adult.opens)
  record(g, 'no page error', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.close()
}

/** Privacy and Delete all (F-111, F-112): from "?", Keep leaves everything, Delete all empties the phone and the take
 * starts again from a first visit. */
async function privacy() {
  const g = 'E Privacy and Delete all'
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE)
  await page.evaluate(() => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at: 3, answers: { 'station-1': { pick: 'Nagsen' } }, lang: 'mix', sound: false, birth: '1990-08-14' })))
  await page.reload()
  await page.locator('[data-help]').click()
  await page.locator('.sheetlinks button').filter({ hasText: 'Privacy' }).click()
  const defs = await page.locator('.sheet .defs').innerText()
  record(g, 'Privacy says what stays on this phone, what is sent and what is kept nowhere', /On this phone/.test(defs) && /Nothing leaves this phone/.test(defs) && /Kept nowhere/.test(defs))
  await page.locator('.sheetlinks .is-danger').click()
  record(g, 'Delete all asks once, in the one dialog, with Keep focused', (await page.locator('.dialog[role="alertdialog"]').count()) === 1 && (await page.evaluate(() => document.activeElement?.textContent)) === 'Keep')
  await page.locator('.dialog .textbtn').filter({ hasText: 'Keep' }).click()
  record(g, 'Keep closes the dialog and keeps everything', (await page.locator('.dialog').count()) === 0 && (await page.evaluate(() => !!localStorage.getItem('retake.take'))))
  await page.locator('.sheetlinks .is-danger').click()
  await page.locator('.dialog .is-danger').click()
  record(g, 'Delete all empties the phone at once and says so', (await page.evaluate(() => localStorage.getItem('retake.take'))) === null && /Deleted/.test(await page.locator('.sheet h2').innerText()))
  await page.waitForTimeout(300)
  record(g, 'nothing is kept again while the line shows', (await page.evaluate(() => localStorage.getItem('retake.take'))) === null)
  await page.locator('.sheet .close').last().click()
  record(g, 'closing it starts again from a first visit: the birth date', (await page.locator('.datefields input').count()) === 3)
  await page.reload()
  record(g, 'and stays so after a reload', (await page.locator('.datefields input').count()) === 3)
  record(g, 'no page error', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.close()
}

/** Back (R-STEP-9): to the previous step, read-only with its answer and a lock, one button back to the current step;
 * from a chapter's first step, its title card reading Continue; the phone's back does the same. */
async function backward() {
  const g = 'E Back: earlier steps, read-only'
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE)
  await page.evaluate(() => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at: 3, answers: {}, lang: 'mix', sound: false, birth: '1990-08-14' })))
  await page.reload()
  await page.locator('.tiles .tile').nth(1).click()
  const picked = await page.locator('.tiles .tile.is-selected').getAttribute('aria-label')
  await page.locator('.take .dock .main').click()
  const second = await look(page)
  await page.locator('.take .topbar .ibtn').first().click()
  const back1 = await look(page)
  record(g, 'Back shows the step before, read-only, with the pick made and its lock',
    /^1 of /.test(back1.label) && back1.cls.includes('is-revisited') && (await page.locator('.tiles .tile.is-selected').getAttribute('aria-label')) === picked)
  await page.locator('.tiles .tile:not(.is-selected)').first().click()
  record(g, 'a revisited step cannot be changed', (await page.locator('.tiles .tile.is-selected').getAttribute('aria-label')) === picked)
  record(g, 'its one button goes to the current step', /current step/.test(back1.button))
  await page.locator('.take .topbar .ibtn').first().click()
  record(g, "from a chapter's first step, Back is the title card, reading Continue", (await page.locator('.take-drawn').count()) === 1 && /Continue/.test((await look(page)).button))
  await page.locator('.take .dock .main').click()
  record(g, 'Continue returns to where the player is', (await look(page)).label === second.label)
  await page.goBack()
  record(g, "the phone's back does the same as Back", /^1 of /.test((await look(page)).label) && (await look(page)).cls.includes('is-revisited'))
  await page.locator('.take .dock .main').click()
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('retake.take') ?? '{}'))
  record(g, 'going back changes no answer and moves the place nowhere', kept.at === 4 && Object.keys(kept.answers).length === 1)
  record(g, 'no page error', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.close()
}

try {
  await gate()
  await privacy()
  await backward()
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
