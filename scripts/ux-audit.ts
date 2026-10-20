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
import { screeningItems, screens as S } from '../src/content'
import { marker, step } from './lib/autoplay'
import { statesPass, type StateResult } from './ux-states'
import { leaks, playSeason } from './season-play'
import { PLACEHOLDER } from './lib/placeholder'

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
/** Recall screens that offered a note other than the one the player saw (owner decision O1). */
const recallLeaks: string[] = []
const DECOYS = new Set(
  S.recall.options
    .filter((o) => 'decoy' in o && o.decoy)
    .flatMap((o) => [o.text.en, o.text.hinglish]),
)
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
  /* Copy hygiene (EVAL-6, X-16): no rendered player copy says PENDING, the disclosure included;
     only the dev-only notes are left out. */
  const said = await page.evaluate(() => {
    const main = document.querySelector('main')?.cloneNode(true) as HTMLElement | undefined
    main?.querySelectorAll('[data-dev]').forEach((e) => e.remove())
    return main?.textContent ?? ''
  })
  if (PLACEHOLDER.test(said))
    problems.push(`${screen}: shows a placeholder (${said.match(PLACEHOLDER)?.[0]})`)
  /* The note register's baseline grid (EVAL-6): running text and lists sit on their ruling, so
     each is a whole number of 28 px lines and no line straddles a rule. */
  const offGrid = await page.evaluate(() => {
    if (document.querySelector('.page')?.getAttribute('data-surface') !== 'oof') return []
    return [...document.querySelectorAll('.page .text, .page .list')]
      .filter((e) => getComputedStyle(e).backgroundImage.includes('gradient'))
      .filter((e) => {
        const h = e.getBoundingClientRect().height
        return h > 0 && Math.abs(h / 28 - Math.round(h / 28)) > 0.02
      })
      .map((e) => `${e.className}: ${Math.round(e.getBoundingClientRect().height)} px`)
  })
  for (const o of offGrid) problems.push(`${screen}: off the 28 px ruling, ${o}`)
  /* EVAL-10 (owner): one action pattern, equal options, one progress bar, plain hierarchy. */
  for (const l of await page.evaluate(() => {
    const out: string[] = []
    /* Every option the player chooses between is the same size: ranking and pick cards, split
       rows, option buttons, radio and checkbox rows (an unequal look nudges choices). */
    for (const [group, item] of [
      ['.tapcards', '.tapcard'],
      ['.split', '.split__row'],
      ['.options', '.options__option'],
      ['.choice__rows', '.choice__option'],
    ]) {
      document.querySelectorAll(group).forEach((g) => {
        const bs = [...g.querySelectorAll(item)]
          .map((e) => e.getBoundingClientRect())
          .filter((b) => b.width > 0)
        if (bs.length < 2) return
        const w = bs.map((b) => Math.round(b.width))
        const h = bs.map((b) => Math.round(b.height))
        if (Math.max(...w) - Math.min(...w) > 1 || Math.max(...h) - Math.min(...h) > 1)
          out.push(`unequal options in ${group}: widths ${w.join('/')}, heights ${h.join('/')}`)
      })
    }
    /* Rows of one question never touch, and in the note register sit half a pitch apart. */
    const oof = document.querySelector('.page')?.getAttribute('data-surface') === 'oof'
    document.querySelectorAll('.choice__rows').forEach((g) => {
      const bs = [...g.children].map((e) => e.getBoundingClientRect())
      bs.slice(1).forEach((b, i) => {
        const gap = b.top - bs[i].bottom
        if (gap < (oof ? 13.5 : 4)) out.push(`option rows ${Math.round(gap)} px apart`)
      })
    })
    /* Question groups in the note register are a full pitch apart. */
    if (oof) {
      const sets = [...document.querySelectorAll('main fieldset.choice')]
      sets.slice(1).forEach((f, i) => {
        const prev = sets[i].getBoundingClientRect()
        const gap = f.getBoundingClientRect().top - prev.bottom
        if (gap > 0 && gap < 27.5) out.push(`question groups ${Math.round(gap)} px apart`)
      })
    }
    /* At most one primary action on a screen. */
    const primaries = [...document.querySelectorAll('main .button--primary')].filter(
      (b) => b.getBoundingClientRect().width > 0,
    )
    if (primaries.length > 1) out.push(`${primaries.length} primary buttons`)
    /* Back is the small nav link at the top, before the heading, never in an action row. */
    const back = [...document.querySelectorAll('main button')].find((b) =>
      /^Back\b/.test(b.getAttribute('aria-label') ?? b.textContent ?? ''),
    )
    if (back) {
      if (!back.closest('.page__nav')) out.push('Back is not the nav link at the top')
      const h1 = document.querySelector('main h1')
      if (h1 && back.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_PRECEDING)
        out.push('Back comes after the heading')
    }
    /* The header (EVAL-12, owner): the chapter label only. No progress bar, chapter circles,
       card dots or any picture; Back stays the nav link under it. */
    const head = document.querySelector('.page__head')
    if (head) {
      if (head.querySelector('.map, [role="img"], [role="progressbar"], progress, svg'))
        out.push('the header carries a progress bar or a picture')
      const kids = [...head.querySelectorAll('*')].filter((e) => e.children.length === 0)
      if (kids.length !== 1 || !kids[0].classList.contains('page__act'))
        out.push('the header holds more than the chapter label')
    }
    /* Descriptions at 17 px or more; card questions in sentence case. */
    document.querySelectorAll('.colleague__desc').forEach((d) => {
      if (parseFloat(getComputedStyle(d).fontSize) < 17) out.push('a description under 17 px')
    })
    document.querySelectorAll('.beat__question').forEach((q) => {
      if (getComputedStyle(q).textTransform !== 'none') out.push('a question set in capitals')
    })
    return out
  }))
    problems.push(`${screen}: ${l}`)
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

/** Tap-to-order by keyboard: Tab to a card, Enter numbers it (announced, focus kept), Enter again takes it back. */
async function tapOrderByKeyboard(page: Page, screen: string) {
  await page.locator('h1').first().focus()
  let reached = false
  for (let i = 0; i < 20 && !reached; i++) {
    await page.keyboard.press('Tab')
    reached = await page.evaluate(
      () => document.activeElement?.classList.contains('tapcard') ?? false,
    )
  }
  if (reached) await page.keyboard.press('Enter')
  const numbered = await page.locator('.tapcard[aria-pressed="true"]').count()
  const live = (await page.locator('.tapcard__sr[aria-live]').textContent()) ?? ''
  const kept = await page.evaluate(() => document.activeElement?.classList.contains('tapcard'))
  if (reached) await page.keyboard.press('Enter')
  const back = await page.locator('.tapcard[aria-pressed="true"]').count()
  keyboard.push({
    card: screen,
    ok: reached && numbered === 1 && live.length > 0 && !!kept && back === 0,
    detail: `tab reaches a card ${reached}; Enter numbers it ${numbered === 1}; announced "${live}"; focus kept ${kept}; Enter again takes it back ${back === 0}`,
  })
}

/** The ranking cards fit at every width from 320 to 1440 px (EVAL-10, owner: they were cut at 860). */
async function cardsFit(page: Page, screen: string) {
  for (const w of [320, 390, 600, 768, 860, 1024, 1280, 1440]) {
    await page.setViewportSize({ width: w, height: 900 })
    await settle(page)
    const cut = await page.evaluate(() => {
      const main = document.querySelector('main')?.getBoundingClientRect()
      const vw = document.documentElement.clientWidth
      return [...document.querySelectorAll('.tapcard')].filter((c) => {
        const b = c.getBoundingClientRect()
        return b.left < 0 || b.right > vw + 0.5 || (!!main && b.right > main.right + 0.5)
      }).length
    })
    if (cut) problems.push(`${screen}: ${cut} ranking cards cut off at ${w} px`)
  }
  await page.setViewportSize({ width: 412, height: 915 })
}

/** The split by keyboard (EVAL-10, the one-tap pairs reverted): Tab to a number, Enter sets it,
    the count left is announced and focus kept; nothing is chosen at the start, nothing advances on
    its own, and "Confirm these shares" appears only once everything is shared. */
async function splitByKeyboard(page: Page, screen: string) {
  const empty =
    (await page.locator('.split__chip[aria-pressed="true"]').count()) === 0 &&
    (await page.getByRole('button', { name: 'Confirm these shares' }).count()) === 0
  await page.locator('h1').first().focus()
  let reached = false
  for (let i = 0; i < 20 && !reached; i++) {
    await page.keyboard.press('Tab')
    reached = await page.evaluate(
      () => document.activeElement === document.querySelectorAll('.split__chip')[1],
    )
  }
  const before = await page.locator('[data-screen]').first().getAttribute('data-screen')
  const pool = Number(((await page.locator('.split__left').textContent()) ?? '').match(/\d+/)?.[0])
  if (reached) await page.keyboard.press('Enter')
  const left = (await page.locator('.split__left').textContent()) ?? ''
  const kept = await page.evaluate(() => document.activeElement?.classList.contains('split__chip'))
  const still = (await page.locator('[data-screen]').first().getAttribute('data-screen')) === before
  const early = await page.getByRole('button', { name: 'Confirm these shares' }).count()
  if (reached) await page.getByRole('button', { name: 'Start again' }).click()
  keyboard.push({
    card: screen,
    ok: empty && reached && left.includes(String(pool - 1)) && !!kept && still && early === 0,
    detail: `empty at the start ${empty}; tab reaches a number ${reached}; Enter shares one ("${left}"); focus kept ${kept}; no auto-advance ${still}; no confirm before all is shared ${early === 0}`,
  })
}

/** The agreement grid by keyboard: Tab into a statement, arrows choose a point, focus stays in it. */
async function gridByKeyboard(page: Page, screen: string) {
  await page.locator('h1').first().focus()
  let reached = false
  for (let i = 0; i < 20 && !reached; i++) {
    await page.keyboard.press('Tab')
    reached = await page.evaluate(
      () => document.activeElement?.classList.contains('agree__input') ?? false,
    )
  }
  if (reached) await page.keyboard.press('ArrowRight')
  const checked = await page.locator('.agree__input:checked').count()
  const named = await page.evaluate(() => {
    const a = document.activeElement as HTMLInputElement | null
    return a?.labels?.[0]?.textContent ?? ''
  })
  keyboard.push({
    card: screen,
    ok: reached && checked === 1 && /Disagree|Strongly/.test(named),
    detail: `tab reaches a point ${reached}; an arrow chooses one ${checked === 1}; its name "${named}"`,
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
  let noteText = ''
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
    if (m.startsWith('note:')) noteText = text
    if (m.startsWith('after:recall')) {
      const offered = (
        await page
          .getByRole('radio')
          .evaluateAll((rs) => rs.map((r) => r.closest('label')?.textContent ?? ''))
      ).filter((t) => !/^(I do not remember|Mujhe yaad nahin)$/.test(t.trim()))
      const ideal = (t: string) => /ideal employee/.test(t)
      const real = offered.filter((t) => !DECOYS.has(t.trim()))
      if (
        real.length !== 1 ||
        offered.length - real.length < 2 ||
        ideal(real[0]) !== ideal(noteText)
      )
        recallLeaks.push(`${prefix}: offered ${offered.join(' / ')}`)
    }
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
  await page.goto(`${BASE}#/dev`)
  await page.getByRole('radio', { name: lang }).check()
  await page.getByRole('button', { name: game }).click()
  await page.waitForSelector('[data-screen="disclosure"]')
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
  let states: StateResult[] = []
  try {
    await page.goto(`${BASE}#/dev`)
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

    await page.goto(`${BASE}#/dev`)
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
    await page.waitForSelector('[data-screen="disclosure"]')
    await play(page, 'firm', new Set())

    /* The season story (EVAL-4): every new kind of screen, its keyboard paths, the result and
       the profile pages. */
    const seasonSeen = new Set<string>()
    await playSeason(page, BASE, async (m) => {
      if (seasonSeen.has(m)) return
      seasonSeen.add(m)
      await audit(page, `season ${m}`)
      if (m === 'story:beat:rank') {
        await cardsFit(page, `season ${m}`)
        await tapOrderByKeyboard(page, `season ${m}`)
      }
      if (m === 'story:beat:split') await splitByKeyboard(page, `season ${m}`)
      /* The merged "Before you start" screen (EVAL-10, owner) fits one phone screen with its
         details closed. */
      if (m === 'start') {
        await page.setViewportSize({ width: 390, height: 844 })
        await settle(page)
        /* The decline button, the last thing on it, is on the first screen. */
        const h = await page.evaluate(() => {
          const b = [...document.querySelectorAll('main .actions button')].pop()
          return b ? Math.round(b.getBoundingClientRect().bottom + window.scrollY) : 9999
        })
        if (h > 844)
          problems.push(`season start: content ends at ${h} px at 390 x 844, over one screen`)
        await page.setViewportSize({ width: 412, height: 915 })
      }
      if (m === 'story:screening') await gridByKeyboard(page, `season ${m}`)
    })
    await audit(page, 'season story:result')
    for (const l of leaks) problems.push(`season ${l}`)
    /* EVAL-12: the landing (signed out, signed in, with a season to resume), "How this works",
       sign-in with its inline and wrong-code errors, and every view of the profile. */
    const landingFits = async (state: string) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await settle(page)
      const bottom = await page.evaluate(() => {
        const last = [...document.querySelectorAll('main > *')].pop()
        return last ? Math.round(last.getBoundingClientRect().bottom + window.scrollY) : 9999
      })
      if (bottom > 844) problems.push(`landing ${state}: content ends at ${bottom} px at 390 x 844`)
      await page.setViewportSize({ width: 412, height: 915 })
    }
    await page.goto(BASE)
    await page.waitForSelector('[data-screen="landing"] .actions')
    await audit(page, 'landing signed out')
    await landingFits('signed out')
    await page.getByRole('link', { name: 'How this works' }).click()
    await page.waitForSelector('[data-screen="how"]')
    await audit(page, 'how this works')
    await page.goto(`${BASE}#/signin`)
    await page.waitForSelector('[data-screen="signin"]')
    await audit(page, 'sign-in')
    const codeField = page.getByRole('textbox', { name: 'Recovery code' })
    await codeField.pressSequentially('DEMO')
    await page.getByRole('alert').waitFor()
    await audit(page, 'sign-in inline error', true)
    await codeField.fill('AAAA-BBBB-CCCC')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.getByRole('alert').waitFor()
    await audit(page, 'sign-in wrong code', true)
    await codeField.fill('DEMQ-PRQF-2XE7')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForSelector('[data-screen="profile"]')
    await audit(page, 'profile')
    await page.getByRole('button', { name: 'See past seasons' }).click()
    await page.waitForSelector('[data-screen="profile-history"]')
    await audit(page, 'profile history')
    await page
      .getByRole('link', { name: /^Open the full report/ })
      .first()
      .click()
    await page.waitForSelector('[data-screen="profile-season"]')
    await audit(page, 'profile season report')
    await page.goto(`${BASE}#/profile/account`)
    await page.waitForSelector('[data-screen="profile-account"]')
    await audit(page, 'profile account')
    await page.getByRole('button', { name: 'Delete my profile and all my records' }).click()
    await page.getByRole('button', { name: 'Keep my profile' }).waitFor()
    await audit(page, 'profile account confirm delete', true)
    await page.getByRole('button', { name: 'Keep my profile' }).click()
    await page.goto(BASE)
    await page.waitForSelector('[data-screen="landing"] .actions')
    await audit(page, 'landing signed in')
    await landingFits('signed in')
    await page.getByRole('button', { name: 'Start a new season' }).click()
    await page.waitForSelector('[data-screen="language"]')
    await page.goto(BASE)
    await page.getByRole('button', { name: 'Resume chapter 1' }).waitFor()
    await audit(page, 'landing resume')
    await landingFits('resume')
    /* Leave the browser as a first visitor finds it: no sign-in, no season in progress. */
    await page.evaluate(() =>
      Object.keys(localStorage)
        .filter((k) => k.startsWith('eval-progress:') || k === 'eval-profile-signin')
        .forEach((k) => localStorage.removeItem(k)),
    )
    await page.reload()

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
    await page.getByRole('button', { name: 'Delete my answers' }).click()
    await page.getByRole('status').waitFor()
    await audit(page, 'withdraw done')
    await page.goto(`${BASE}#/withdraw?now=2027-04-01`)
    await page.reload()
    await page.waitForSelector('[data-screen]')
    await audit(page, 'withdraw closed')
    await page.getByRole('textbox').fill(g1code)
    await page.getByRole('button', { name: 'Delete my answers' }).click()
    await page.getByRole('alert').waitFor()
    walk.push({
      page: 'withdraw after the window, game 1 code',
      text: await page.getByRole('alert').innerText(),
    })
    await evidence(page, 'withdraw closed')
    await page.goto(`${BASE}#/play/not-a-token`)
    await page.getByRole('alert').waitFor()
    await audit(page, 'link refused')
    states = await statesPass(page, BASE)
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
    stateFails: states.filter((r) => !r.ok).length,
    textSlips: textSlips.length,
    recallLeaks: recallLeaks.length,
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
        recallLeaks,
        states,
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
  for (const r of states.filter((x) => !x.ok))
    console.log(`state FAIL ${r.component}: ${r.state} (${r.detail})`)
  console.log(`states: ${states.filter((x) => x.ok).length}/${states.length} passed`)
  console.log(`ux: ${screens.length} screens x ${VARIANTS.length} variants -> ${OUT}`)
  if (failing) process.exit(1)
}

await main()
