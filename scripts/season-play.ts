/**
 * `pnpm season`: plays one whole season story in Chrome at 390 x 844, as a person would, through
 * the accessible roles only, and counts every decision and every click (a tap, a check, a
 * key press that answers). It screenshots each new kind of screen into out/season/ and prints
 * the screen list and the totals, which knowledge/reviews/game-redesign-2026-10-19.md records.
 * BASE=http://localhost:5184/ plays a running dev server; without it, it starts its own. A
 * BASE holding #/play/<token> starts from that link instead of the demo home page.
 * Policy (POLICY): by default follow the stronger notes and, on equal notes, put the man first
 * (so the result shows a lean and its evidence); split 4 and 2; choose the first option; agree
 * "4" with every statement. It then saves the result to a new profile and opens
 * the profile page.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { createServer } from 'vite'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = process.env.OUT ?? join(ROOT, 'out/season')
const WIDTH = Number(process.env.WIDTH ?? 390)
const HEIGHT = Number(process.env.HEIGHT ?? 844)
/** Rendered player copy that says PENDING (the dev-only notes aside; no screen is exempt). */
export const leaks: string[] = []

let clicks = 0
let decisions = 0
let asked = 0
const screens: { n: number; screen: string; clicks: number; heading: string }[] = []
const shot = new Set<string>()

/** Each description's merit tier, from the content: the scripted player reads the notes as a person would. */
const TIER = new Map<string, number>(
  (
    JSON.parse(readFileSync(join(ROOT, 'content/story.json'), 'utf8')) as {
      stories: { beats?: { descriptions?: { tier: number; text: { en: string } }[] }[] }[]
    }
  ).stories.flatMap((s) =>
    (s.beats ?? []).flatMap((b) => (b.descriptions ?? []).map((d) => [d.text.en, d.tier] as const)),
  ),
)
/**
 * POLICY=notes (default here: notes, then men first on equal notes) follows the stronger notes
 * and breaks ties towards the men, so the result page shows a lean and its evidence;
 * POLICY=order taps in the order shown.
 */
const POLICY = process.env.POLICY ?? 'notes-men'
async function preference(page: Page, sel: string): Promise<number[]> {
  const cards = await page.locator(sel).evaluateAll((els) =>
    els.map((e) => ({
      desc: e.querySelector('.colleague__desc')?.textContent ?? '',
      man: /^man,/.test(e.querySelector('.portrait')?.getAttribute('aria-label') ?? ''),
    })),
  )
  const idx = cards.map((_, i) => i)
  if (POLICY === 'order') return idx
  return idx.sort(
    (a, b) =>
      (TIER.get(cards[b].desc) ?? 0) - (TIER.get(cards[a].desc) ?? 0) ||
      (POLICY === 'notes-men' ? Number(cards[b].man) - Number(cards[a].man) : 0),
  )
}

const marker = (page: Page) => page.locator('[data-screen]').first().getAttribute('data-screen')
const click = async (_page: Page, l: ReturnType<Page['locator']>) => {
  await l.click()
  clicks += 1
}

async function waitNew(page: Page, before: string) {
  await page
    .waitForFunction((b) => document.querySelector('[data-screen]')?.innerHTML !== b, before, {
      timeout: 20000,
    })
    .catch(() => {})
}

/**
 * Plays from the home page to the result. `onScreen` runs on each new screen before it is
 * answered (pnpm ux audits there); without it, each new kind of screen is screenshotted.
 */
export const totals = () => ({ clicks, decisions, asked, screens })

export async function playSeason(
  page: Page,
  base: string,
  onScreen?: (marker: string) => Promise<void>,
) {
  if (/#\/play\//.test(base)) await page.goto(base)
  /* The demo landing goes straight into the season (EVAL-6). */ else await page.goto(base)
  await page.waitForSelector('[data-screen="demo"]', { timeout: 30000 })
  for (let guard = 0; guard < 200; guard++) {
    await page.waitForSelector('[data-screen]')
    const m = (await marker(page)) ?? ''
    const before = await page.locator('[data-screen]').first().innerHTML()
    const heading = (
      (await page
        .locator('h1')
        .first()
        .textContent()
        .catch(() => '')) ?? ''
    ).trim()
    const c0 = clicks
    const name = m.replace(/^story:/, '')
    const said = await page.evaluate(() => {
      const main = document.querySelector('main')?.cloneNode(true) as HTMLElement | undefined
      main?.querySelectorAll('[data-dev]').forEach((e) => e.remove())
      return main?.textContent ?? ''
    })
    if (/PENDING/.test(said)) leaks.push(m)
    /* Faces and mascots are drawn or generated images, never system emoji, so they do not vary
       by phone font: no pictographic character on a season screen, and no text in a portrait. */
    const emoji = await page.evaluate(() => {
      const main = document.querySelector('main')
      const portraits = [...document.querySelectorAll('.portrait')].some(
        (e) => (e.textContent ?? '').trim() !== '',
      )
      return /\p{Extended_Pictographic}/u.test(main?.textContent ?? '') || portraits
    })
    if (emoji && m.startsWith('story:')) leaks.push(`${m}: emoji`)
    /* No season screen falls back to the old card components (emoji figures, steppers, drag rows). */
    if (await page.locator('.character, .alloc__step, .sort__row').count())
      leaks.push(`${m}: old card component`)
    if (onScreen) await onScreen(m)
    else if (!shot.has(name)) {
      shot.add(name)
      await page.screenshot({ path: join(OUT, `${name.replaceAll(':', '-')}.png`), fullPage: true })
    }
    if (m === 'story:result') {
      screens.push({ n: screens.length + 1, screen: m, clicks: 0, heading })
      return
    }
    const button = (n: string | RegExp, o: { exact?: boolean } = {}) =>
      page.getByRole('button', { name: n, ...o })
    const grid = async (counts: boolean) => {
      const groups = page.locator('fieldset')
      const n = await groups.count()
      for (let i = 0; i < n; i++) {
        await groups.nth(i).getByRole('radio', { name: /^4,/ }).check()
        clicks += 1
        asked += 1
        if (counts) decisions += 1
      }
      await click(page, button('Done with these statements'))
    }
    if (
      m === 'demo' ||
      m === 'disclosure' ||
      m === 'story:intro' ||
      m === 'story:episode' ||
      m === 'story:interlude' ||
      m === 'story:reveal' ||
      m === 'story:note'
    )
      await click(page, page.locator('.page__actions button').first())
    else if (m === 'eligibility') {
      for (const name of [/18 or over/, /work in India/]) {
        await page.getByRole('group', { name }).getByRole('radio', { name: 'Yes' }).check()
        clicks += 1
        asked += 1
      }
      await click(page, button('Continue'))
    } else if (m === 'consent') await click(page, button('I agree to take part'))
    else if (m === 'language') {
      await page.getByRole('radio', { name: 'English' }).check()
      clicks += 1
      await click(page, button('Continue'))
    } else if (m === 'story:pick')
      await click(page, page.locator('.storypick__card:not([aria-disabled="true"])').first())
    else if (m === 'story:beat:rank') {
      decisions += 1
      asked += 1
      const cards = page.locator('.tapcard')
      const order = await preference(page, '.tapcard')
      for (const i of order.slice(0, 3)) await click(page, cards.nth(i))
    } else if (m === 'story:beat:pick') {
      decisions += 1
      asked += 1
      await click(page, page.locator('.tapcard').nth((await preference(page, '.tapcard'))[0]))
    } else if (m === 'story:beat:ordinary') {
      asked += 1
      await click(page, page.locator('.options__option').first())
    } else if (m === 'story:beat:split') {
      decisions += 1
      asked += 1
      const rows = page.locator('.split__row')
      const order = await preference(page, '.split__row')
      await click(page, rows.nth(order[0]).getByRole('button', { name: /: 4$/ }))
      await click(page, rows.nth(order[1]).getByRole('button', { name: /: 2$/ }))
    } else if (m === 'story:screening' || m === 'story:fsurvey') await grid(true)
    else if (m === 'story:recall') {
      decisions += 1
      asked += 1
      await click(page, page.locator('.options__option').first())
    } else if (m === 'story:probe') {
      asked += 1
      await page.getByRole('checkbox', { name: /woman or a man/ }).check()
      clicks += 1
      await click(page, button('Done'))
    } else if (m === 'story:season' || m === 'story:debrief' || m === 'story:demographics')
      await click(page, button('Continue'))
    else if (m === 'story:prior') {
      asked += 1
      const no = button('No', { exact: true })
      await click(page, (await no.count()) ? no : page.locator('.options__option').first())
    } else if (m === 'story:code') {
      await page.locator('.code').waitFor({ timeout: 20000 })
      await page.getByRole('checkbox').check()
      clicks += 1
      await click(page, button('Continue'))
    } else if (m === 'story:submit') {
      await click(page, button('Submit my answers'))
      /* Submit derives the code's keys and writes once: wait for the result, or say why not. */
      await page
        .waitForSelector('[data-screen="story:result"]', { timeout: 60000 })
        .catch(async () => {
          throw new Error(`submit did not finish: ${await page.locator('main').innerText()}`)
        })
    } else throw new Error(`no rule for screen ${m}`)
    screens.push({ n: screens.length + 1, screen: m, clicks: clicks - c0, heading })
    await waitNew(page, before)
  }
  throw new Error('did not reach the result')
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  let server: Awaited<ReturnType<typeof createServer>> | null = null
  let base = process.env.BASE
  if (!base) {
    server = await createServer({ root: ROOT, logLevel: 'silent', server: { port: 5197 } })
    await server.listen()
    base = 'http://localhost:5197/'
  }
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: Number(process.env.DPR ?? 1),
  })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  try {
    await playSeason(page, base)
    const result = await page.locator('main').innerText()
    await page.getByRole('textbox', { name: /display name/ }).fill('Tester')
    await page.getByRole('button', { name: 'Create my profile and save' }).click()
    await page.locator('.code').nth(0).waitFor()
    await page.screenshot({ path: join(OUT, 'result-saved.png'), fullPage: true })
    await page.getByRole('link', { name: 'Open my profile' }).click()
    await page.waitForSelector('[data-screen="profile"]')
    await page.screenshot({ path: join(OUT, 'profile.png'), fullPage: true })
    const summary = {
      decisions,
      asked,
      clicks,
      screensToResult: screens.length,
      byKind: screens.reduce<Record<string, { screens: number; clicks: number }>>((a, s) => {
        const k = s.screen
        a[k] ??= { screens: 0, clicks: 0 }
        a[k].screens += 1
        a[k].clicks += s.clicks
        return a
      }, {}),
      errors,
    }
    writeFileSync(
      join(OUT, 'run.json'),
      JSON.stringify({ summary, screens, result, leaks }, null, 1),
    )
    console.log(JSON.stringify({ ...summary, leaks }, null, 1))
    if (errors.length || leaks.length) process.exitCode = 1
  } finally {
    await browser.close()
    await server?.close()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
