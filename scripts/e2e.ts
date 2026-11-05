/**
 * `pnpm e2e` (rewritten for Retake's First take, EVAL-18): the whole take in Chromium on a production build served
 * with vercel.json's headers, in each language mode (Hinglish, Hindi, English) on a phone (412 x 915) and on a laptop
 * (1440 x 900, the wide layout). Every screen is played through its own controls: cutscenes panel by panel, the five
 * title cards, all 40 decisions by their kind (pick one and Believe, spend checks, rank, pick a team and keep, the
 * batting order, split), and the reading's five cards.
 *   - The take reaches its end and every decision's answer is kept on the phone, and nothing else: no times. The
 *     finished take rests on its reading.
 *   - Each kind's main button waits until the decision is complete (it goes live only on the tap its "1 more" asked
 *     for), then names its consequence.
 *   - The reading's five cards each say something in the chosen language (Devanagari in Hindi mode).
 *   - No screen scrolls sideways, and no page error or console error (a CSP refusal is one) anywhere.
 *   - A reload mid-take comes back on the same screen.
 * Then Delete all by every way out of it (the phone's back, a second window), the phone's back inside the "?" sheet
 * and where there is nothing to go back to, focus on each new screen, and kept answers that no longer fit.
 */
import { readFileSync } from 'node:fs'
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
const FLOW: { type: string; id?: string; kind?: string; need?: number; people?: { en: string }[] }[] = JSON.parse(
  readFileSync(join(ROOT, 'content/take/first-take.json'), 'utf8'),
).flow
const LAST = FLOW.length - 1
const READING = FLOW.findIndex((s) => s.type === 'results')
const ADULT = { v: 1, lang: 'mix', sound: false, birth: '1990-08-14' }

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

/** Answers the decision on screen through its own controls; returns whether the button waited until it was done: it
 * waits on arrival, and in the row kinds it goes live only on the tap its "1 more" asked for. */
async function answer(page: Page, cls: string) {
  let waited = !(await look(page)).live
  const tap = async (target: ReturnType<Page['locator']>) => {
    const before = await look(page)
    await target.click()
    const after = await look(page)
    if (after.live && !before.live && !/(^|\D)1(\D|$)/.test(before.button)) waited = false
  }
  if (/\bjs-(pick|checks)\b/.test(cls)) await page.locator('.tiles .tile').first().click()
  else if (/\bjs-rank\b/.test(cls)) {
    const n = await page.locator('.rows .row').count()
    for (let i = 0; i < n; i++) await tap(page.locator('.rows .row:not(.is-selected)').filter({ has: page.locator('.rkno:empty') }).first())
  } else if (/\bjs-multi\b/.test(cls)) {
    for (let i = 0; i < 8 && !(await look(page)).live; i++) await tap(page.locator('.rows .row[aria-checked="false"]').first())
  } else if (/\bjs-order\b/.test(cls)) {
    while (await page.locator('.cr-tray .row:not([hidden])').count()) await tap(page.locator('.cr-tray .row:not([hidden])').first())
  } else if (/\bjs-split\b/.test(cls)) {
    for (let i = 0; i < 12 && !(await look(page)).live; i++) await tap(page.locator('.rk-family .row').nth(i % 2))
  }
  return waited
}
/** The kept take, or null. */
const kept = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('retake.take') ?? 'null'))
const setTake = (page: Page, t: object) => page.evaluate((t) => localStorage.setItem('retake.take', JSON.stringify(t)), t)
const onBirthDate = async (page: Page) => (await page.locator('.datefields input').count()) === 3

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
  let ended = false
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
    if (before === LAST && after !== LAST) {
      ended = after === READING && (await look(page)).cls.includes('js-res')
      break
    }
  }
  const take = (await kept(page)) ?? {}
  const answers = Object.keys(take.answers ?? {})
  record(T, `${tag}: the take reaches its end with all 40 answers kept`, answers.length === 40, `${answers.length} answers; kinds ${JSON.stringify(Object.fromEntries(kinds))}`)
  record(T, `${tag}: every kind was played`, ['pick', 'checks', 'rank', 'multi', 'order', 'split'].every((k) => kinds.has(k)))
  record(T, `${tag}: past the last screen the finished take rests on its reading, its answers kept`, ended && answers.length === 40)
  record(T, `${tag}: the phone keeps the place, the answers, the language, the sound switch, the birth date and that the rating is asked, nothing else`,
    JSON.stringify(Object.keys(take).sort()) === JSON.stringify(['answers', 'at', 'birth', 'lang', 'rate', 'sound', 'v']))
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
  record(g, 'Privacy says what stays on this phone, what is sent and what is kept nowhere', /On this phone/.test(defs) && /Sent, if you choose/.test(defs) && /Stars, a line and the date/.test(defs) && /Kept nowhere/.test(defs))
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
 * from a chapter's first step, its title card reading Continue; the phone's back does the same. The title card (SC-91)
 * names its chapter, and its Back plays the chapter's way in again. */
async function backward() {
  const g = 'E Back: earlier steps, read-only'
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE)
  await page.evaluate(() => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at: 3, answers: {}, lang: 'mix', sound: false, birth: '1990-08-14' })))
  await page.reload()
  // Station's first decision is a crew of 2 (rows)
  const checked = () => page.$$eval('.rows .row[aria-checked="true"]', (xs) => xs.map((x) => x.getAttribute('aria-label')).sort().join('|'))
  await page.locator('.rows .row').nth(0).click()
  await page.locator('.rows .row').nth(1).click()
  const picked = await checked()
  await page.locator('.take .dock .main').click()
  const second = await look(page)
  await page.locator('.take .topbar .ibtn').first().click()
  const back1 = await look(page)
  record(g, 'Back shows the step before, read-only, with the picks made and its lock',
    /^1 of /.test(back1.label) && back1.cls.includes('is-revisited') && picked.split('|').length === 2 && (await checked()) === picked, picked)
  await page.locator('.rows .row[aria-checked="false"]').first().click()
  record(g, 'a revisited step cannot be changed', (await checked()) === picked)
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
  await page.evaluate(() => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at: 2, answers: {}, lang: 'mix', sound: false, birth: '1990-08-14' })))
  await page.reload()
  const card = await page.locator('.take-drawn').innerText()
  record(g, 'a title card names its chapter, its area and its setting, with Start',
    /Chapter 1 of 5/.test(card) && /Work/.test(card) && /bullying/.test(card) && /Start/.test((await look(page)).button), card.replace(/\s+/g, ' '))
  await page.locator('.take [data-back]').click()
  record(g, "Back from a title card plays the chapter's way in again", (await page.locator('.cutpanel:not([hidden])').count()) === 1)
  await page.locator('.cutbar .textbtn').click()
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('retake.take') ?? '{}'))
  record(g, 'Skip there comes back to the title card, the place unmoved',
    (await page.locator('.take-drawn').count()) === 1 && /Start/.test((await look(page)).button) && after.at === 2)
  record(g, 'no page error', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.close()
}

/** Delete all by every way out of it: the phone's back while "Deleted." shows, and a second window of the take on the
 * same phone, which follows the first window's progress and its Delete all and never writes deleted data back. */
async function deletion() {
  const g = 'E Delete all, by every way out of it'
  const errors: string[] = []
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 } })
  const a = await ctx.newPage()
  const b = await ctx.newPage()
  for (const p of [a, b]) p.on('pageerror', (e) => errors.push(String(e)))
  await a.goto(BASE)
  await setTake(a, { ...ADULT, at: 3, answers: {} })
  await a.reload()
  await a.locator('.take .app').waitFor()
  await b.goto(BASE)
  await b.locator('.take .app').waitFor()
  const first = await look(b)
  await a.locator('.rows .row').nth(0).click()
  await a.locator('.rows .row').nth(1).click()
  await a.locator('.take .dock .main').click()
  await b.waitForFunction((l) => document.querySelector('.take .app')?.getAttribute('aria-label') !== l, first.label)
  record(g, 'a second window follows the first onto its next decision', (await look(b)).label === (await look(a)).label)
  await a.locator('[data-help]').first().click()
  await a.locator('.sheetlinks button').filter({ hasText: 'Privacy' }).click()
  await a.locator('.sheetlinks .is-danger').click()
  await a.locator('.dialog .is-danger').click()
  await b.waitForFunction(() => document.querySelectorAll('.datefields input').length === 3)
  record(g, "the second window goes to a first visit with the first window's Delete all", await onBirthDate(b))
  // a new start in the second window while the first still shows "Deleted.": it holds, and nothing deleted comes back
  await b.locator('.langchips button').nth(1).click()
  for (const [i, v] of ['14', '08', '1990'].entries()) await b.locator('.datefields input').nth(i).fill(v)
  await b.locator('.take .dock .main').click()
  await b.waitForTimeout(800)
  const mid = await kept(a)
  record(g, 'a new start in the second window holds while the first shows "Deleted."',
    !(await onBirthDate(b)) && (await b.locator('.cutpanel').count()) > 0 && mid?.birth === '1990-08-14' && mid.at === 0 && !Object.keys(mid.answers ?? {}).length, JSON.stringify(mid))
  await a.goBack()
  await a.locator('.cutpanel').first().waitFor({ timeout: 3000 }).catch(() => {})
  const end = await kept(a)
  record(g, "the phone's back on \"Deleted.\" leaves it for the second window's new start, nothing of the deleted take kept",
    (await a.locator('.sheet').count()) === 0 && (await a.locator('.cutpanel').count()) > 0 && end?.at === 0 && !Object.keys(end.answers ?? {}).length, JSON.stringify(end))
  await b.close()
  // alone: Delete all, then Escape (the close request Android's back sends where the browser has CloseWatcher); the
  // second window chose Hindi, so the Privacy link is found by its place
  await a.locator('[data-help]').first().click()
  await a.locator('.sheetlinks button').first().click()
  await a.locator('.sheetlinks .is-danger').click()
  await a.locator('.dialog .is-danger').click()
  await a.keyboard.press('Escape')
  record(g, 'Escape on "Deleted." starts again from a first visit, with nothing kept', (await onBirthDate(a)) && (await kept(a)) === null)
  record(g, 'no page error', errors.length === 0, errors.slice(0, 2).join(' | '))
  await ctx.close()
}

/** The phone's back: a step with Back holds one history entry for it, added only on a tap (Chrome skips an entry added
 * without one), never on opening and, after a press, again only on the next tap; a reload adds none; where there is
 * nothing to go back to there is no entry, so a press leaves the game. Inside the "?" sheet a close request (Android's
 * back, or Escape) goes one level up. Nothing behind an open sheet takes focus or taps. Focus moves to each new
 * screen's heading, back to "?" when the sheet closes, and stays on a refused button. */
async function phoneBack() {
  const g = "E the phone's back and focus"
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  const guard = () => page.evaluate(() => history.state?.retake === 1)
  await page.goto(BASE)
  await setTake(page, { ...ADULT, at: 4, answers: {} })
  await page.reload()
  await page.locator('.take .app').waitFor()
  const step = await look(page)
  record(g, 'opening on a step adds no history entry before a tap', !(await guard()))
  await page.locator('.take h1').click()
  record(g, 'the first tap adds the one entry for Back', await guard())
  const len = await page.evaluate(() => history.length)
  await page.reload()
  await page.locator('.take .app').waitFor()
  await page.locator('.take h1').click()
  record(g, 'a reload adds no second entry', (await page.evaluate(() => history.length)) === len && (await guard()))
  await page.locator('.take .dock .main').focus()
  await page.keyboard.press('Enter')
  record(g, 'a refused press keeps the focus on the button', await page.evaluate(() => !!document.activeElement?.classList.contains('main')))
  await page.locator('[data-help]').first().click()
  record(g, 'with "?" open, nothing behind it takes focus or taps', await page.evaluate(() => !!document.querySelector('.take .dock .main')?.closest('[inert]')))
  await page.locator('.sheetlinks button').filter({ hasText: 'Privacy' }).click()
  await page.keyboard.press('Escape')
  record(g, "a close request on Privacy goes up to the sheet's first level", (await page.locator('.sheet .howline').count()) === 1)
  await page.keyboard.press('Escape')
  record(g, 'another closes the sheet over the same step, with the focus back on "?"',
    (await page.locator('.sheet').count()) === 0 && (await look(page)).label === step.label && (await page.evaluate(() => document.activeElement?.hasAttribute('data-help') ?? false)))
  record(g, 'and the step still has its entry to go back from', await guard())
  await page.goBack()
  record(g, "the phone's back on a step shows the step before, read-only", (await look(page)).cls.includes('is-revisited') && (await look(page)).label !== step.label)
  record(g, 'after a press there is no entry until the next tap', !(await guard()))
  await page.locator('.take h1').click()
  record(g, 'and a tap adds it again', await guard())
  await page.locator('.take .dock .main').click()
  await answer(page, step.cls)
  await page.locator('.take .dock .main').click()
  record(g, "a new screen's heading takes the focus", await page.evaluate(() => document.activeElement?.tagName === 'H1'))
  await setTake(page, { ...ADULT, at: 0, answers: {} })
  await page.reload()
  await page.locator('.take .app').waitFor()
  await page.waitForFunction(() => history.state?.retake !== 1, null, { timeout: 3000 }).catch(() => {})
  record(g, "on the opening there is nothing to go back to and no entry: the phone's back leaves the game", !(await guard()))
  record(g, 'no page error', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.close()
}

/** A kept answer that no longer fits its decision (saved under another kind, naming someone not in it, or given under
 * other content) is dropped on opening, never crashes a screen and never reaches the reading. */
async function stale() {
  const g = 'E kept answers that no longer fit'
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  const s3 = FLOW.find((s) => s.id === 'station-3')!
  await page.goto(BASE)
  await setTake(page, {
    ...ADULT,
    at: 6,
    answers: { 'station-1': { pick: 'Mumtaz' }, 'station-2': { order: ['Nobody'] }, 'station-3': { pick: s3.people![0].en, s: 'old' }, 'gone-1': { pick: 'X' } },
  })
  await page.reload()
  await page.locator('.take .app').waitFor()
  const t = await kept(page)
  record(g, 'they are dropped on opening, and the take opens where it was', Object.keys(t.answers).length === 0 && t.at === 6, JSON.stringify(t.answers))
  await page.locator('.take .topbar .ibtn').first().click()
  record(g, 'a step whose answer was dropped opens read-only and empty', (await look(page)).cls.includes('is-revisited') && (await page.locator('.is-selected').count()) === 0)
  record(g, 'no page error', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.close()
}

/** The rating (EVAL-24), the database stood in for by Playwright, with vercel.json's Content-Security-Policy in force:
 * asked once, after the very last screen; the wait, the failure, the send; exactly what leaves the phone; every way of
 * taking it back, with and without a signal. */
async function rating() {
  const g = 'E the rating after the take: asked once, and only what the player sends leaves'
  const DB = 'https://the-equal-lens-default-rtdb.asia-southeast1.firebasedatabase.app'
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'PATCH, DELETE', 'access-control-allow-headers': '*' }
  const open = async (size = { width: 412, height: 915 }) => {
    const page = await browser.newPage({ viewport: size })
    const net = { answer: 200, sent: [] as { method: string; url: string; body: string | null; cookie: boolean }[] }
    await page.route(`${DB}/**`, async (route) => {
      const r = route.request()
      if (r.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
      net.sent.push({ method: r.method(), url: r.url(), body: r.postData(), cookie: 'cookie' in r.headers() })
      return route.fulfill({ status: net.answer, headers: cors, body: '' })
    })
    return { page, net }
  }
  const keys = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('retake.rating') ?? 'null'))
  const finished = { v: 1, at: LAST, answers: {}, lang: 'en', sound: false, birth: '1990-08-14' }
  const set = (p: Page, s: object, k?: object) =>
    p.evaluate(([s, k]) => {
      localStorage.setItem('retake.take', JSON.stringify(s))
      if (k) localStorage.setItem('retake.rating', JSON.stringify(k))
    }, [s, k] as const)

  const { page, net } = await open()
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  const others: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith(BASE) && !r.url().startsWith(DB) && !r.url().startsWith('data:')) others.push(r.url())
  })
  const sheet = page.locator('.ratesheet')
  await page.goto(BASE)
  await set(page, { ...finished, at: READING })
  await page.reload()
  await page.locator('.restext').waitFor()
  record(g, 'not on the reading before the last screen', (await sheet.count()) === 0)
  await set(page, finished)
  await page.reload()
  await page.locator('.take .app').waitFor()
  record(g, 'not on the last screen itself', (await sheet.count()) === 0)
  for (let i = 0; i < 12 && !(await sheet.count()); i++) await tapMain(page)
  await sheet.waitFor()
  record(g, 'past the last screen it rises over the reading', (await page.locator('.restext').count()) === 1 && (await look(page)).cls.includes('js-res'))
  const main = sheet.locator('.main')
  record(g, 'the button waits and says what is missing', (await main.innerText()).trim() === 'Tap a star' && (await main.getAttribute('aria-disabled')) === 'true')
  record(g, 'five stars, none on, each a named radio', (await sheet.locator('input[type="radio"]').count()) === 5 && (await sheet.locator('.ratestar.is-on').count()) === 0 && (await sheet.getByRole('radio', { name: '3 stars' }).count()) === 1)
  record(g, 'the reading beneath takes no taps', await page.locator('.page-play > .dock').evaluate((e) => (e as HTMLElement).inert))
  await main.click({ force: true })
  record(g, 'pressed with no star, nothing is sent', net.sent.length === 0)
  await sheet.getByRole('radio', { name: '4 stars' }).check({ force: true })
  record(g, 'four stars fill four', (await sheet.locator('.ratestar.is-on').count()) === 4 && (await main.innerText()).trim() === 'Send')
  await page.reload()
  await sheet.waitFor()
  record(g, 'a reload before answering asks again', (await sheet.count()) === 1)
  await sheet.getByRole('radio', { name: '4 stars' }).check({ force: true })
  const field = sheet.locator('input[type="text"]')
  await field.fill('x'.repeat(300))
  record(g, 'the line stops at 140', (await field.inputValue()).length === 140)
  await field.fill('  The cricket chapter dragged.  ')
  await field.press('Enter')
  record(g, "the keyboard's own key puts it away and sends nothing", net.sent.length === 0 && (await page.evaluate(() => document.activeElement?.tagName !== 'INPUT')))
  await page.mouse.click(200, 40)
  record(g, 'a tap outside keeps the sheet, the stars and the line', (await sheet.count()) === 1 && (await sheet.locator('.ratestar.is-on').count()) === 4 && (await field.inputValue()).includes('cricket'))
  net.answer = 401
  await main.click()
  await sheet.locator('.ratefail').waitFor()
  record(g, 'refused: it says so, and the stars and the line stay', (await sheet.locator('.ratestar.is-on').count()) === 4 && (await field.inputValue()).includes('cricket'))
  record(g, 'refused: still asked', (await kept(page)).rate === 'ask')
  const firstTry = (await keys(page)).mine as string
  net.answer = 200
  await main.click()
  await sheet.getByRole('heading', { name: 'Thank you.' }).waitFor()
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('retake.rating') ?? '{}').drop?.length === 0)
  const patch = net.sent.filter((x) => x.method === 'PATCH')
  const body = JSON.parse(patch.at(-1)?.body ?? '{}') as Record<string, Record<string, unknown>>
  const key = Object.keys(body).find((k) => k.startsWith('retake-feedback/')) ?? ''
  const id = key.split('/')[1] ?? ''
  record(g, 'exactly two writes, the refused one and this', patch.length === 2)
  record(g, 'the record: the stars, the trimmed line and the day, nothing else', JSON.stringify(body[key]) === JSON.stringify({ stars: 4, line: 'The cricket chapter dragged.', sent: new Date().toISOString().slice(0, 10) }) || /^\{"stars":4,"line":"The cricket chapter dragged\.","sent":"\d{4}-\d\d-\d\d"\}$/.test(JSON.stringify(body[key])), JSON.stringify(body[key]))
  record(g, 'the write holds only the record and the gate that names it', JSON.stringify(Object.keys(body).sort()) === JSON.stringify([key, 'retake-feedback-gate'].sort()) && JSON.stringify(body['retake-feedback-gate']) === JSON.stringify({ at: { '.sv': 'timestamp' }, id }), JSON.stringify(body['retake-feedback-gate']))
  record(g, 'no cookie goes with it', net.sent.every((x) => !x.cookie))
  record(g, 'the refused try is taken back, in case it landed with its reply lost', net.sent.some((x) => x.method === 'DELETE' && x.url.includes(`/retake-feedback/${firstTry}.json`)))
  record(g, 'the phone keeps only the key and that it was asked', (await keys(page)).mine === id && (await kept(page)).rate === 'done' && !('sent' in (await kept(page))) && /^[A-Za-z0-9_-]{22}$/.test(id))
  await sheet.locator('.close').click()
  record(g, 'closed, the reading rests under it, and takes the focus', (await sheet.count()) === 0 && (await page.locator('.restext').count()) === 1 && (await page.evaluate(() => document.activeElement?.tagName === 'H1')))
  record(g, 'closing after Thank you takes nothing back', !net.sent.some((x) => x.method === 'DELETE' && x.url.includes(id)))
  await page.reload()
  await page.locator('.restext').waitFor()
  record(g, 'never asked again', (await sheet.count()) === 0)
  await page.locator('[data-help]').click()
  await page.locator('.sheetlinks button').filter({ hasText: 'Privacy' }).click()
  await page.locator('.sheetlinks .is-danger').click()
  net.answer = 503
  await page.locator('.dialog .is-danger').click()
  await page.locator('.sheet .letter').filter({ hasText: 'No signal' }).waitFor()
  record(g, 'Delete all with no signal says so, and the key waits', (await keys(page)).drop.includes(id) && !(await keys(page)).mine)
  net.answer = 200
  await page.reload()
  await page.waitForFunction(() => localStorage.getItem('retake.rating') === null)
  const dels = net.sent.filter((x) => x.method === 'DELETE' && x.url.includes(`/retake-feedback/${id}.json`))
  record(g, 'the next opening with a signal removes it, by its key alone, and then nothing of it is left', dels.length === 2 && dels.every((x) => !x.body), `${dels.length} calls`)
  record(g, 'nothing went anywhere else', others.length === 0, others.slice(0, 3).join(', '))
  record(g, 'no page error', errors.length === 0, errors.slice(0, 2).join(' | '))
  await page.close()

  // closing it sends nothing
  const a = await open()
  await a.page.goto(BASE)
  await set(a.page, { ...finished, at: READING, rate: 'ask' })
  await a.page.reload()
  await a.page.locator('.ratesheet').waitFor()
  await a.page.locator('.ratesheet .close').click()
  await a.page.waitForFunction(() => JSON.parse(localStorage.getItem('retake.take') ?? '{}').rate === 'done')
  record(g, 'closed unanswered: nothing is sent, and it is not asked again', a.net.sent.length === 0)
  await a.page.close()

  // closed after "Not sent": that try may have landed, so it is taken back
  const b = await open()
  await b.page.goto(BASE)
  await set(b.page, { ...finished, at: READING, rate: 'ask' })
  await b.page.reload()
  await b.page.getByRole('radio', { name: '2 stars' }).check({ force: true })
  b.net.answer = 503
  await b.page.locator('.ratesheet .main').click()
  await b.page.locator('.ratefail').waitFor()
  const tried = (await keys(b.page)).mine as string
  b.net.answer = 200
  await b.page.locator('.ratesheet .close').click()
  await b.page.waitForFunction(() => localStorage.getItem('retake.rating') === null)
  record(g, 'closed after "Not sent": that try is taken back', b.net.sent.some((x) => x.method === 'DELETE' && x.url.includes(tried)))
  await b.page.close()

  // "Not you?": with no signal the key waits, and the next player is asked
  const c = await open()
  await c.page.goto(BASE)
  await set(c.page, { ...finished, at: READING, rate: 'done' }, { mine: 'A'.repeat(22), drop: [] })
  c.net.answer = 503
  await c.page.reload()
  await c.page.locator('.restext').waitFor()
  for (let i = 0; i < 4; i++) await tapMain(c.page)
  await c.page.locator('.resforget').click()
  await c.page.locator('.take .app').waitFor()
  await c.page.waitForFunction(() => !JSON.parse(localStorage.getItem('retake.take') ?? '{}').rate)
  record(g, '"Not you?" with no signal: the key waits, and the next player will be asked', ((await keys(c.page))?.drop ?? []).includes('A'.repeat(22)) && !(await kept(c.page)).rate)
  c.net.answer = 200
  await c.page.reload()
  await c.page.waitForFunction(() => localStorage.getItem('retake.rating') === null)
  record(g, '"Not you?": the next opening with a signal removes it', c.net.sent.filter((x) => x.method === 'DELETE' && x.url.includes('A'.repeat(22)) ).length >= 2)
  await c.page.close()

  // above a phone's keyboard, on the smallest phone
  const d = await open({ width: 360, height: 640 })
  await d.page.goto(BASE)
  await set(d.page, { ...finished, at: READING, rate: 'ask' })
  await d.page.reload()
  const small = d.page.locator('.ratesheet')
  await small.waitFor()
  await small.evaluate((e) => (e as HTMLElement).style.setProperty('--kb', '300px'))
  const box = await small.boundingBox()
  record(g, 'with a 300 px keyboard on a 360 x 640 phone the sheet stays on screen and above it', !!box && box.y >= 0 && Math.round(box.y + box.height) <= 340, JSON.stringify(box))
  await d.page.locator('.ratesheet .main').scrollIntoViewIfNeeded()
  const mainBox = await d.page.locator('.ratesheet .main').boundingBox()
  record(g, 'and it scrolls to Send', !!mainBox && mainBox.y + mainBox.height <= 345, JSON.stringify(mainBox))
  await d.page.close()
}

/** Each chapter's "?" holds its checked help line, and the whole row calls the number (F-47). */
async function helpLines() {
  const g = 'E the help line in each chapter\'s "?"'
  const want: Record<string, [string, string, string]> = {
    station: ['14416', 'Upset by bullying at work? Talk to a counsellor, free: 14416.', 'काउंसलर'],
    lugdi: ['112', 'In danger right now? Call 112.', '112 पर कॉल'],
    jadugar: ['112', 'In danger right now? Call 112.', '112 पर कॉल'],
    cricket: ['112', 'In danger right now? Call 112.', '112 पर कॉल'],
    rukavat: ['15100', 'Free legal advice: 15100.', 'क़ानूनी सलाह'],
  }
  const screens = FLOW as unknown as { type: string; world?: string }[]
  for (const [world, [tel, en, hi]] of Object.entries(want)) {
    const page = await browser.newPage({ viewport: { width: 412, height: 915 } })
    const at = screens.findIndex((s) => s.type === 'step' && s.world === world)
    await page.goto(BASE)
    await page.evaluate((at) => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at, answers: {}, lang: 'en', sound: false, birth: '1990-08-14' })), at)
    await page.reload()
    await page.locator('[data-help]').click()
    const a = page.locator('.sheet a.helpline')
    record(g, `${world}: says the checked words and calls ${tel}`, (await a.getAttribute('href')) === `tel:${tel}` && (await a.innerText()).trim() === en, await a.innerText())
    const box = await a.boundingBox()
    record(g, `${world}: the whole row is at least 48 tall`, !!box && box.height >= 48)
    await page.locator('.sheet .langchips [lang="hi"]').click()
    record(g, `${world}: in Hindi too`, (await a.innerText()).includes(hi), await a.innerText())
    await page.close()
  }
  const cuts = screens.flatMap((s, i) => (s.type === 'cut' ? [i] : []))
  for (const [what, at, tel] of [["the opening's cutscene", cuts[0], '14416'], ['the last cutscene', cuts.at(-1)!, '15100']] as const) {
    const page = await browser.newPage({ viewport: { width: 412, height: 915 } })
    await page.goto(BASE)
    await page.evaluate((at) => localStorage.setItem('retake.take', JSON.stringify({ v: 1, at, answers: {}, lang: 'en', sound: false, birth: '1990-08-14' })), at)
    await page.reload()
    await page.locator('[data-help]').click()
    record(g, `${what}: "?" holds the line and calls ${tel}`, (await page.locator('.sheet a.helpline').getAttribute('href')) === `tel:${tel}`)
    await page.close()
  }
}

try {
  await rating()
  await helpLines()
  await gate()
  await privacy()
  await backward()
  await deletion()
  await phoneBack()
  await stale()
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
