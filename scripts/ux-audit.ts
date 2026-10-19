/**
 * `pnpm ux`: the ship-readiness accessibility audit (knowledge/reviews/ux-audit-2026-10-19.md).
 * Plays every screen type of panel game 1 (all branches), game 2, the firm session and the
 * pages around them in the demo build, and on each new screen runs the Nivel checks
 * (scripts/lib/ux-checks.js) and axe-core at 412 x 915, 320 x 800 and 1280 x 900, light and
 * dark, one viewport at a time on one page, with reduced motion so axe never reads a fade.
 * It also checks that focus lands on the new screen's heading, and works the drag-to-rank and
 * allocation cards by keyboard alone.
 * Usage: pnpm ux [label]   writes knowledge/reviews/assets/ux-audit-2026-10-19-<label>.json
 * and fails when any count is not zero.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { createServer } from 'vite'
import { screeningItems } from '../src/content'
import { marker, step } from './lib/autoplay'

const ROOT = new URL('..', import.meta.url).pathname
const LABEL = process.argv[2] ?? 'latest'
const ASSETS = join(ROOT, 'knowledge/reviews/assets')
const OUT =
  LABEL === 'latest'
    ? join(ROOT, 'out/ux-audit.json')
    : join(ASSETS, `ux-audit-2026-10-19-${LABEL}.json`)
const PORT = 5198
const BASE = `http://localhost:${PORT}/`
const CHECKS = readFileSync(join(ROOT, 'scripts/lib/ux-checks.js'), 'utf8')
const AXE = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8')
const VARIANTS = [
  { id: '412-light', w: 412, h: 915, scheme: 'light' as const, target: 44 },
  { id: '412-dark', w: 412, h: 915, scheme: 'dark' as const, target: 44 },
  { id: '320-light', w: 320, h: 800, scheme: 'light' as const, target: 44 },
  { id: '320-dark', w: 320, h: 800, scheme: 'dark' as const, target: 44 },
  { id: '1280-light', w: 1280, h: 900, scheme: 'light' as const, target: 24 },
  { id: '1280-dark', w: 1280, h: 900, scheme: 'dark' as const, target: 24 },
]
const DEFAULT_TITLE = 'Team season'

interface Check {
  title: string
  hOverflow: number
  targets: number
  underTarget: string[]
  noName: string[]
  h1: number
  headingSkips: number
  textUnder12: string[]
  contrastFails: string[]
  skipLink: boolean
  needsSkip: boolean
  liveRegion: boolean
  needsLive: boolean
}
interface AxeResult {
  violations: { id: string; impact: string; nodes: { target: string[] }[] }[]
}
const perVariant: Record<string, ({ screen: string } & Check & { axe: string[] })[]> = {}
const focusFails: string[] = []
const keyboard: { card: string; ok: boolean; detail: string }[] = []
const problems: string[] = []
const screens: string[] = []
/** The task walkthroughs: what each session showed where the owner's reviewer found defects. */
const walk: Record<string, unknown>[] = []
const SLIP = /\bthey (was|is|has|does)\b|[.!?] [a-z]/
const textSlips: string[] = []
const SHOTS = new Set([
  'firm firstWeek:people:ranking',
  'firm firstWeek:people:allocation',
  'g1 wrap:code',
  'g1 wrap:result',
])

async function evidence(page: Page, name: string) {
  if (LABEL === 'latest') return
  await page.screenshot({
    path: join(ASSETS, `ux-audit-2026-10-19-${LABEL}-${name.replaceAll(/[ :]/g, '-')}.jpg`),
    type: 'jpeg',
    quality: 70,
    fullPage: true,
  })
}

async function settle(page: Page) {
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null)))),
  )
}

/** The disclosure is registered as the four sentences and Continue, with no heading
    (candidates v12 3.10), so it is left out of the heading and title counts. */
const NO_HEADING = /disclosure$/

/** `inPage`: a result shown on the same screen (a status line), where focus stays where it was. */
async function audit(page: Page, screen: string, inPage = false) {
  screens.push(screen)
  const focus = await page.evaluate((inPage) => {
    const a = document.activeElement
    if (inPage) return !!a && a !== document.body
    const h = document.querySelector('h1')
    return h ? a === h : a?.tagName === 'MAIN'
  }, inPage)
  if (!focus) focusFails.push(screen)
  for (const v of VARIANTS) {
    await page.setViewportSize({ width: v.w, height: v.h })
    await page.emulateMedia({ colorScheme: v.scheme, reducedMotion: 'reduce' })
    await settle(page)
    if (!(await page.evaluate(() => 'axe' in window))) {
      await page.addScriptTag({ content: CHECKS })
      await page.addScriptTag({ content: AXE })
    }
    const r = await page.evaluate(
      (t) => (window as never as { __uxCheck: (t: number) => Check }).__uxCheck(t),
      v.target,
    )
    const ax = (await page.evaluate(() =>
      (window as never as { axe: { run: (c: unknown) => Promise<unknown> } }).axe.run({
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      }),
    )) as AxeResult
    const axe = ax.violations
      .filter((x) => !(NO_HEADING.test(screen) && x.id === 'page-has-heading-one'))
      .flatMap((x) => x.nodes.map((n) => `${x.id} ${n.target.join(' ')}`))
    ;(perVariant[v.id] ??= []).push({ screen, ...r, axe })
  }
  await page.setViewportSize({ width: 412, height: 915 })
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
}

/** Works the ranking card by keyboard alone: Tab to a move button, Enter, and keep focus. */
async function sortByKeyboard(page: Page, screen: string) {
  await page.locator('h1, main').first().focus()
  let reached = false
  for (let i = 0; i < 40 && !reached; i++) {
    await page.keyboard.press('Tab')
    reached = await page.evaluate(
      () => document.activeElement === document.querySelectorAll('.sort__move')[1],
    )
  }
  const names = () => page.locator('.sort__row').evaluateAll((rs) => rs.map((r) => r.textContent))
  const before = await names()
  if (reached) await page.keyboard.press('Enter')
  const after = await names()
  const live = (await page.locator('.sort__live').textContent()) ?? ''
  const n = before.length
  for (let i = 0; i < n; i++) await page.keyboard.press('Enter')
  const kept = await page.evaluate(() => document.activeElement?.classList.contains('sort__move'))
  const ok = reached && before[0] !== after[0] && live.length > 0 && !!kept
  keyboard.push({
    card: screen,
    ok,
    detail: `tab reaches move button ${reached}; Enter moves row ${before[0] !== after[0]}; announced "${live}"; focus kept at the end of the list ${kept}`,
  })
}

/** Works the allocation card by keyboard alone: Tab to a plus, Space until all is shared. */
async function allocateByKeyboard(page: Page, screen: string) {
  await page.locator('h1, main').first().focus()
  let reached = false
  for (let i = 0; i < 40 && !reached; i++) {
    await page.keyboard.press('Tab')
    reached = await page.evaluate(
      () => document.activeElement === document.querySelectorAll('.alloc__step')[1],
    )
  }
  for (let i = 0; i < 20 && reached; i++) await page.keyboard.press('Space')
  const done = await page.locator('.alloc__left--done').count()
  const kept = await page.evaluate(() => document.activeElement?.classList.contains('alloc__step'))
  keyboard.push({
    card: screen,
    ok: reached && done > 0 && !!kept,
    detail: `tab reaches plus ${reached}; all shared by Space ${done > 0}; focus kept when the plus is spent ${kept}`,
  })
}

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

async function play(
  page: Page,
  prefix: string,
  seen: Set<string>,
  opts: { fair?: boolean; withdraw?: boolean } = {},
) {
  let code = ''
  let sawScreening = false
  const log: Record<string, unknown> = { session: prefix, screens: 0 }
  for (let guard = 0; guard < 400; guard++) {
    const m = (await marker(page)) ?? 'unknown'
    log.screens = (log.screens as number) + 1
    const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
    const slip = text.match(SLIP)
    if (slip)
      textSlips.push(
        `${prefix} ${m}: ${text.slice(Math.max(0, (slip.index ?? 0) - 40), (slip.index ?? 0) + 30)}`,
      )
    if (m === 'wrap:result') log.result = text
    if (m === 'wrap:code')
      log.codeScreen =
        text.match(/From .*?\.(?= )|.* tak isse withdraw kar sakte hain\./)?.[0] ?? text
    if (m.endsWith(':code')) {
      await page.locator('.code').waitFor({ timeout: 20000 })
      code = ((await page.locator('.code').textContent()) ?? '').trim()
    }
    const key = m.replace(/:\d+$/, '')
    if (key.startsWith('screening')) sawScreening = true
    const kind = (await page.locator('.sort').count())
      ? 'sort'
      : (await page.locator('.alloc').count())
        ? 'alloc'
        : ''
    const typeKey = kind ? `${prefix}:${kind}` : key
    if (!seen.has(typeKey)) {
      seen.add(typeKey)
      await audit(page, `${prefix} ${key}`)
      if (SHOTS.has(`${prefix} ${key}`) && (kind || !key.includes(':people')))
        await evidence(page, `${prefix} ${key}`)
      if (kind === 'sort') await sortByKeyboard(page, `${prefix} ${key}`)
      if (kind === 'alloc') await allocateByKeyboard(page, `${prefix} ${key}`)
    }
    if (m.startsWith('screening:screening') && opts.fair) await answerScreeningFairly(page)
    if (m === 'wrap:submit') {
      await step(page, { submit: !opts.withdraw, withdraw: opts.withdraw })
      await page.waitForSelector('[data-screen="finished"]')
      if (!seen.has('finished')) {
        seen.add('finished')
        await audit(page, `${prefix} ${opts.withdraw ? 'withdrawn' : 'submitted'}`)
      }
      log.finished = opts.withdraw ? 'withdrawn' : 'submitted'
      walk.push(log)
      return { code, partial: !sawScreening }
    }
    const before = await page.locator('[data-screen]').first().innerHTML()
    if (!(await step(page))) throw new Error(`${prefix}: stuck at ${m}`)
    await page
      .waitForFunction((b) => document.querySelector('[data-screen]')?.innerHTML !== b, before, {
        timeout: 20000,
      })
      .catch(() => {})
  }
  throw new Error(`${prefix}: did not finish`)
}

async function startFromHome(page: Page, lang: RegExp, game: RegExp) {
  await page.goto(BASE)
  await page.getByRole('radio', { name: lang }).check()
  await page.getByRole('button', { name: game }).click()
  await page.waitForSelector('[data-screen="demo"]')
}

async function main() {
  const server = await createServer({
    root: ROOT,
    logLevel: 'silent',
    server: { port: PORT, strictPort: true },
  })
  await server.listen()
  const browser = await chromium.launch({ channel: 'chrome' })
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`))
  try {
    await page.goto(BASE)
    await page.waitForSelector('[data-screen="home"]')
    await audit(page, 'home')

    let g1code = ''
    const g1 = new Set<string>()
    const met = { low: false, m1h: false, partial: false }
    for (let i = 0; i < 24 && !(met.low && met.m1h && met.partial); i++) {
      await startFromHome(page, i === 0 ? /^Bilingual/ : /^English only/, /^Panel, game 1$/)
      const r = await play(page, 'g1', g1, { fair: i % 2 === 1 })
      g1code = r.code
      met.low ||= g1.has('note:note')
      met.m1h ||= g1.has('offTheRecord:m1h-direct')
      met.partial ||= r.partial
    }
    if (!met.low || !met.m1h) problems.push(`game 1 branches not all met: ${JSON.stringify(met)}`)

    await startFromHome(page, /^Hinglish only/, /^Panel, game 2$/)
    const g2 = await play(page, 'g2', new Set())
    await startFromHome(page, /^English only/, /^Panel, game 2$/)
    await play(page, 'g2en', new Set(), { withdraw: true })

    await page.goto(BASE)
    await page.getByRole('button', { name: /^Firm session/ }).click()
    await page.waitForSelector('[data-screen="disclosure"]')
    await audit(page, 'firm enrol-disclosure')
    await step(page)
    await audit(page, 'firm enrol-consent')
    await step(page)
    await page.waitForSelector('[data-screen="enrol-form"]')
    await audit(page, 'firm enrol-form')
    await step(page)
    await page.waitForSelector('[data-screen="enrol-done"]')
    await audit(page, 'firm enrol-done')
    await page.getByRole('link', { name: /^Demo: open the play link/ }).click()
    await page.waitForSelector('[data-screen="demo"]')
    await play(page, 'firm', new Set())

    await page.goto(`${BASE}#/explain`)
    await page.waitForSelector('[data-screen]')
    await audit(page, 'explain form')
    await page.getByRole('textbox').fill(g2.code)
    await page.getByRole('button', { name: 'Open the explanation' }).click()
    await page.getByRole('status').waitFor()
    await audit(page, 'explain before release', true)
    walk.push({ page: 'explain before release', text: await page.getByRole('status').innerText() })
    await page.goto(`${BASE}#/explain?now=2027-03-02`)
    await page.reload()
    await page.getByRole('textbox').fill(g2.code)
    await page.getByRole('button', { name: 'Open the explanation' }).click()
    await page.waitForSelector('[data-screen="explain-open"]')
    await audit(page, 'explain open')
    const otherDep = await page.locator('main').innerText()
    walk.push({
      page: 'explain open, game 2',
      paragraph: otherDep.match(/First, which note.*?\n/)?.[0]?.trim(),
    })
    await page.goto(`${BASE}#/withdraw`)
    await page.reload()
    await page.waitForSelector('[data-screen]')
    await audit(page, 'withdraw form')
    await page.getByRole('textbox').fill(g2.code)
    await page.getByRole('button', { name: 'Delete my records' }).click()
    await page.getByRole('status').waitFor()
    await audit(page, 'withdraw done')
    await page.goto(`${BASE}#/withdraw?now=2027-04-01`)
    await page.reload()
    await page.waitForSelector('[data-screen]')
    await audit(page, 'withdraw closed')
    await page.getByRole('textbox').fill(g1code)
    await page.getByRole('button', { name: 'Delete my records' }).click()
    await page.getByRole('alert').waitFor()
    walk.push({
      page: 'withdraw after the window, game 1 code',
      text: await page.getByRole('alert').innerText(),
    })
    await evidence(page, 'withdraw closed')
    await page.goto(`${BASE}#/play/not-a-token`)
    await page.getByRole('alert').waitFor()
    await audit(page, 'link refused')
  } finally {
    await browser.close()
    await server.close()
  }

  const counts: Record<string, Record<string, number>> = {}
  for (const v of VARIANTS) {
    const rs = perVariant[v.id]
    counts[v.id] = {
      contrastFails: rs.reduce((a, r) => a + r.contrastFails.length, 0),
      underTarget: rs.reduce((a, r) => a + r.underTarget.length, 0),
      targets: rs.reduce((a, r) => a + r.targets, 0),
      noName: rs.reduce((a, r) => a + r.noName.length, 0),
      headingSkips: rs.reduce((a, r) => a + r.headingSkips, 0),
      noH1: rs.filter((r) => r.h1 !== 1 && !NO_HEADING.test(r.screen)).length,
      overflowScreens: rs.filter((r) => r.hOverflow > 0).length,
      untitled: rs.filter(
        (r) => (!r.title || r.title === DEFAULT_TITLE) && !NO_HEADING.test(r.screen),
      ).length,
      noSkipLinkWhereNeeded: rs.filter((r) => r.needsSkip && !r.skipLink).length,
      noSkipLink: rs.filter((r) => !r.skipLink).length,
      noLiveWhereNeeded: rs.filter((r) => r.needsLive && !r.liveRegion).length,
      textUnder12: rs.reduce((a, r) => a + r.textUnder12.length, 0),
      axe: rs.reduce((a, r) => a + r.axe.length, 0),
    }
  }
  const totals = {
    screens: screens.length,
    focusNotOnHeading: focusFails.length,
    keyboardFails: keyboard.filter((k) => !k.ok).length,
    problems: problems.length,
    textSlips: textSlips.length,
  }
  const failing =
    Object.values(counts).some((c) =>
      Object.entries(c).some(([k, n]) => k !== 'targets' && k !== 'noSkipLink' && n > 0),
    ) ||
    Object.values(totals)
      .slice(1)
      .some((n) => n > 0)
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        label: LABEL,
        totals,
        counts,
        focusFails,
        keyboard,
        problems,
        textSlips,
        walkthroughs: walk,
        screens: perVariant,
      },
      null,
      1,
    ),
  )
  console.log(JSON.stringify({ totals, counts }, null, 1))
  console.log(
    JSON.stringify(
      walk.map((w) => ({ ...w, result: undefined })),
      null,
      1,
    ),
  )
  const axeIds = new Map<string, number>()
  for (const rs of Object.values(perVariant))
    for (const r of rs)
      for (const a of r.axe) axeIds.set(a.split(' ')[0], (axeIds.get(a.split(' ')[0]) ?? 0) + 1)
  console.log(`axe rules: ${[...axeIds].map(([k, n]) => `${k} ${n}`).join(', ') || 'none'}`)
  console.log(`ux: ${screens.length} screens x ${VARIANTS.length} variants -> ${OUT}`)
  if (failing) process.exit(1)
}

await main()
