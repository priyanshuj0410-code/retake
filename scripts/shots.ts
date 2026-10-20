/**
 * Screenshots of every act of every session, and of the pages around them, at 390 px and
 * 1440 px wide, in light and dark: out/shots/<width>-<scheme>/<name>.png, and an index of what
 * was captured at out/shots/index.txt. Runs the demo build on a local Vite server with the demo
 * store (no backend); the scoring explanation is shown open by the demo clock (?now=).
 * Usage: pnpm shots
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { createServer } from 'vite'
import { screeningItems } from '../src/content'
import { marker, step } from './lib/autoplay'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'out/shots')
const PORT = 5199
const BASE = `http://localhost:${PORT}/`
const VARIANTS = [
  { w: 390, h: 844, scheme: 'light' as const },
  { w: 390, h: 844, scheme: 'dark' as const },
  { w: 1440, h: 900, scheme: 'light' as const },
  { w: 1440, h: 900, scheme: 'dark' as const },
]
const captured: string[] = []
const problems: string[] = []

async function shoot(page: Page, name: string) {
  for (const v of VARIANTS) {
    await page.setViewportSize({ width: v.w, height: v.h })
    await page.emulateMedia({ colorScheme: v.scheme, reducedMotion: 'reduce' })
    const dir = join(OUT, `${v.w}-${v.scheme}`)
    mkdirSync(dir, { recursive: true })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    if (overflow > 0)
      problems.push(`${name} at ${v.w} ${v.scheme}: ${overflow} px of sideways scroll`)
    /* The page's own height, then one viewport-sized capture: a full-page capture resizes the
       viewport mid-shot, and min-height: 100vh then paints the page twice. */
    const h = await page.evaluate(() =>
      Math.ceil(document.querySelector('.page')?.scrollHeight ?? document.body.scrollHeight),
    )
    await page.setViewportSize({ width: v.w, height: Math.max(v.h, h) })
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))),
    )
    await page.waitForTimeout(60)
    await page.screenshot({ path: join(dir, `${name}.png`) })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  captured.push(name)
}

/** Fair answers on the screening block, so a run can reach the high-scorer (M1-H) route. */
async function answerScreeningFairly(page: Page) {
  const legend = (await page.locator('legend').first().textContent()) ?? ''
  const item = screeningItems.find((i) => i.text.en === legend || i.text.hinglish === legend)
  if (!item) return
  const radios = page.getByRole('radio')
  if (item.format === 'direct') await radios.nth(item.keying === 'agree-fair' ? 4 : 0).check()
  else {
    const fairest = item.options?.find((o) => o.fairness === 1)
    await page.getByRole('radio', { name: fairest?.text.en ?? '' }).check()
  }
}

async function playSession(
  page: Page,
  prefix: string,
  opts: {
    fair?: boolean
    only?: RegExp
    stopAt?: RegExp
    withdraw?: boolean
    seen?: Set<string>
  } = {},
) {
  const seen = opts.seen ?? new Set<string>()
  let code = ''
  let sawScreening = false
  for (let guard = 0; guard < 400; guard++) {
    const m = (await marker(page)) ?? 'unknown'
    if (m.endsWith(':code')) {
      await page.locator('.code').waitFor({ timeout: 20000 })
      code = ((await page.locator('.code').textContent()) ?? '').trim()
    }
    const key = m.replace(/:\d+$/, '')
    if (key.startsWith('screening')) sawScreening = true
    if (!seen.has(key) && (!opts.only || opts.only.test(key))) {
      seen.add(key)
      await shoot(
        page,
        `${prefix}-${String(seen.size).padStart(2, '0')}-${key.replaceAll(':', '-')}`,
      )
    }
    if (opts.stopAt && opts.stopAt.test(key)) return { code, seen, partial: !sawScreening }
    if (m.startsWith('screening:screening') && opts.fair) await answerScreeningFairly(page)
    if (m === 'wrap:submit') {
      await step(page, { submit: !opts.withdraw, withdraw: opts.withdraw })
      await page.waitForSelector('[data-screen="finished"]')
      if (!seen.has('finished')) {
        seen.add('finished')
        await shoot(page, `${prefix}-zz-${opts.withdraw ? 'withdrawn' : 'submitted'}`)
      }
      return { code, seen, partial: !sawScreening }
    }
    const before = await page.locator('[data-screen]').first().innerHTML()
    const moved = await step(page)
    if (!moved) throw new Error(`${prefix}: stuck at ${m}`)
    await page
      .waitForFunction((b) => document.querySelector('[data-screen]')?.innerHTML !== b, before, {
        timeout: 20000,
      })
      .catch(() => {})
  }
  throw new Error(`${prefix}: did not finish`)
}

async function startFromHome(page: Page, langLabel: RegExp, game: RegExp) {
  await page.goto(BASE)
  await page.getByRole('radio', { name: langLabel }).check()
  await page.getByRole('button', { name: game }).click()
  await page.waitForSelector('[data-screen="disclosure"]')
}

async function main() {
  rmSync(OUT, { recursive: true, force: true })
  const server = await createServer({
    root: ROOT,
    logLevel: 'silent',
    server: { port: PORT, strictPort: true },
  })
  await server.listen()
  const browser = await chromium.launch({ channel: 'chrome' })
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`))
  try {
    await page.goto(BASE)
    await page.waitForSelector('[data-screen="home"]')
    await shoot(page, 'a-home')

    /* Game 1: runs until every branch has been met (plan v2 1.1): the low scorers' honest
       survey, note and second half; the high scorers' Off the Record with M1-H's statement
       route; R1's partial arms going straight to the wrap. Each screen is captured once. */
    const g1seen = new Set<string>()
    const branches = { low: false, m1h: false, partial: false }
    for (let i = 0; i < 24 && !(branches.low && branches.m1h && branches.partial); i++) {
      await startFromHome(page, i === 0 ? /^Bilingual/ : /^English only/, /^Panel, game 1$/)
      const r = await playSession(page, 'g1', { fair: i % 2 === 1, seen: g1seen })
      branches.low ||= g1seen.has('note:note')
      branches.m1h ||= g1seen.has('offTheRecord:m1h-direct')
      branches.partial ||= r.partial
    }
    if (!branches.low || !branches.m1h)
      problems.push(`game 1 branches not all met: ${JSON.stringify(branches)}`)

    /* Game 2, Hinglish: format practice, private diary, Committee Inbox, truthful-message arm. */
    await startFromHome(page, /^Hinglish only/, /^Panel, game 2$/)
    const g2 = await playSession(page, 'g2')

    /* Game 2 in English, ending in a withdrawal at session end. */
    await startFromHome(page, /^English only/, /^Panel, game 2$/)
    await playSession(page, 'g2en', { only: /^(inbox|wrap)/, withdraw: true })

    /* The firm: enrolment, then the play session inside its window. */
    await page.goto(BASE)
    await page.getByRole('button', { name: /^Firm session/ }).click()
    await page.waitForSelector('[data-screen="disclosure"]')
    await shoot(page, 'f-00-enrol-disclosure')
    await step(page)
    await shoot(page, 'f-01-enrol-consent')
    await step(page)
    await page.waitForSelector('[data-screen="enrol-form"]')
    await step(page)
    await page.waitForSelector('[data-screen="enrol-done"]')
    await shoot(page, 'f-02-enrol-done')
    await page.getByRole('link', { name: /^Demo: open the play link/ }).click()
    await page.waitForSelector('[data-screen="disclosure"]')
    await playSession(page, 'f')

    /* After play: the explanation (closed, then open after the release), and withdrawal. */
    const code = g2.code
    await page.goto(`${BASE}#/explain`)
    await page.getByRole('textbox').fill(code)
    await page.getByRole('button', { name: 'Open the explanation' }).click()
    await page.getByRole('status').waitFor()
    await shoot(page, 'x-explain-before-release')
    await page.goto(`${BASE}#/explain?now=2027-03-02`)
    await page.reload()
    await page.getByRole('textbox').fill(code)
    await page.getByRole('button', { name: 'Open the explanation' }).click()
    await page.waitForSelector('[data-screen="explain-open"]')
    await shoot(page, 'x-explain-open')
    await page.goto(`${BASE}#/withdraw`)
    await page.getByRole('textbox').fill(code)
    await shoot(page, 'x-withdraw')
    await page.getByRole('button', { name: 'Delete my answers' }).click()
    await page.getByRole('status').waitFor()
    await shoot(page, 'x-withdrawn')
    await page.goto(`${BASE}#/results`)
    await page.getByRole('button', { name: /^Play 120 demo sessions$/ }).click()
    await page.getByRole('table').first().waitFor({ timeout: 120000 })
    await shoot(page, 'x-results')
    await page.goto(`${BASE}#/play/not-a-token`)
    await page.getByRole('alert').waitFor()
    await shoot(page, 'x-link-refused')
  } finally {
    await browser.close()
    await server.close()
  }
  writeFileSync(
    join(OUT, 'index.txt'),
    `${captured.length} screens x ${VARIANTS.length} variants\n${captured.join('\n')}\n\nproblems:\n${problems.join('\n') || 'none'}\n`,
  )
  console.log(
    `shots: ${captured.length} screens x ${VARIANTS.length} variants in out/shots; problems: ${problems.length ? '\n  ' + problems.join('\n  ') : 'none'}`,
  )
  if (problems.length) process.exit(1)
}

await main()
