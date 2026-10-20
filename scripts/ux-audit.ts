/**
 * `pnpm ux`: every screen of the trainer, in Chrome, at 390 and 320 px (phones) and 1280 px,
 * with reduced motion so nothing is caught mid-move. Every screen of all 14 days is reached by
 * playing (the onboarding, each day's cover, every step and its phases, each result, both
 * Sunday weeks, the board, the prototype menu, and Hindi screens). On each it runs the
 * in-page checks (scripts/lib/ux-checks.js: computed contrast of every text against its real
 * ground, target sizes, names, headings, sideways scroll, text under 12 px), axe-core, the
 * symmetric-options check (every resting option in a set is drawn alike), and checks focus is
 * on the new screen's h1. Fails on any finding. Writes out/ux-audit.json.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from 'playwright-core'
import { DAYS } from '../src/content'
import { anchorDate } from '../src/engine/calendar'
import { newPlayer, open, phone, seed, startApp } from './lib/app'
import { playDay } from './lib/bot'
import { record, summary } from './lib/check'

const ROOT = new URL('..', import.meta.url).pathname
const T = 'U the screens in a browser (contrast, targets, names, axe, symmetry)'
const CHECKS = readFileSync(join(ROOT, 'scripts/lib/ux-checks.js'), 'utf8')
const AXE = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8')
const VARIANTS = [
  { w: 390, h: 844, target: 44 },
  { w: 320, h: 720, target: 44 },
  { w: 1280, h: 900, target: 24 },
]

interface Finding {
  screen: string
  width: number
  kind: string
  detail: string
}
const findings: Finding[] = []
const seen: string[] = []

async function audit(page: Page, screen: string) {
  const vp = page.viewportSize()!
  for (const v of VARIANTS) {
    await page.setViewportSize({ width: v.w, height: v.h })
    await page.evaluate(() => document.fonts.ready)
    const r = (await page.evaluate(
      ([checks, axe, target]) => {
        if (!(window as unknown as { __uxCheck?: unknown }).__uxCheck) {
          new Function(checks as string)()
          new Function(axe as string)()
        }
        const R = (window as unknown as { __uxCheck: (n: number) => Record<string, unknown> }).__uxCheck(target as number)
        const sym: string[] = []
        const KEYS = ['backgroundColor', 'color', 'borderTopWidth', 'borderTopStyle', 'fontSize', 'fontWeight', 'fontFamily', 'paddingTop', 'paddingLeft', 'borderTopLeftRadius', 'boxShadow'] as const
        for (const g of document.querySelectorAll('[data-options]')) {
          const rest = [...g.children].filter(
            (c) => c.getAttribute('aria-checked') !== 'true' && c.getAttribute('aria-pressed') !== 'true' && c.getAttribute('aria-disabled') !== 'true',
          )
          const sig = rest.map((c) => KEYS.map((k) => getComputedStyle(c)[k]).join('|'))
          if (new Set(sig).size > 1) sym.push(`${g.getAttribute('aria-label')}: ${new Set(sig).size} looks`)
        }
        return { ...R, sym, focus: document.activeElement?.tagName ?? '' }
      },
      [CHECKS, AXE, v.target],
    )) as Record<string, unknown> & { sym: string[]; focus: string }
    const axe = (await page.evaluate(async () => {
      const res = await (window as unknown as { axe: { run: (c: unknown, o: unknown) => Promise<{ violations: { id: string; nodes: unknown[] }[] }> } }).axe.run(document, {
        resultTypes: ['violations'],
      })
      return res.violations.map((x) => `${x.id} (${x.nodes.length})`)
    })) as string[]
    const add = (kind: string, xs: unknown) => {
      const list = Array.isArray(xs) ? xs : xs ? [xs] : []
      for (const d of list) findings.push({ screen, width: v.w, kind, detail: String(d) })
    }
    add('contrast', r.contrastFails)
    add('target', r.underTarget)
    add('no name', r.noName)
    add('text under 12 px', r.textUnder12)
    add('sideways scroll', (r.hOverflow as number) > 0 ? `${r.hOverflow}px` : null)
    add('h1 count', r.h1 !== 1 ? `${r.h1}` : null)
    add('heading skip', (r.headingSkips as number) > 0 ? `${r.headingSkips}` : null)
    add('title', r.title ? null : 'empty')
    add('skip link needed', r.needsSkip && !r.skipLink ? 'something focusable before main' : null)
    add('options not alike', r.sym)
    add('axe', axe)
  }
  await page.setViewportSize(vp)
  seen.push(screen)
}

async function arrived(page: Page, screen: string) {
  const f = await page.evaluate(() => document.activeElement?.tagName ?? '')
  if (f !== 'H1') findings.push({ screen, width: 390, kind: 'focus', detail: `focus on ${f}, not the h1` })
}

const app = await startApp(5310)
try {
  const page = await phone(app.browser)
  await seed(page, app.base, null)
  await open(page, app.base, '#/?day=1')
  await audit(page, 'onboarding: language')
  await page.getByRole('radio', { name: 'English' }).click()
  await page.waitForSelector('h1')
  await audit(page, 'onboarding: road name')
  await seed(page, app.base, newPlayer())
  for (const d of DAYS) {
    const date = anchorDate(d.n)
    await open(page, app.base, `#/?date=${date}`)
    await audit(page, `${d.id} cover`)
    if (d.sunday) continue
    let phase = 0
    await playDay(page, app.base, date, 'consistent', async (st, p) => {
      phase++
      if (p === 'arrive') await arrived(page, `${d.id} ${st.id}`)
      await audit(page, `${d.id} ${st.id} ${p}`)
    })
    void phase
    await arrived(page, `${d.id} result`)
    await audit(page, `${d.id} result`)
    if (d.n === 7 || d.n === 13) {
      await open(page, app.base, `#/week?date=${anchorDate(d.n === 7 ? 7 : 14)}`)
      await audit(page, `week ${d.n === 7 ? 1 : 2}`)
    }
  }
  await open(page, app.base, '#/week?day=14')
  await audit(page, 'week 2, Sunday')
  await open(page, app.base, '#/board?day=14')
  await audit(page, 'board')
  await page.getByRole('searchbox').fill('ka')
  await page.getByRole('button', { name: 'Find' }).click()
  await audit(page, 'board: search results')
  await open(page, app.base, '#/dev')
  await audit(page, 'prototype menu')

  /* Hindi screens: a pulp cover in Devanagari, a step, its result and a week. */
  await seed(page, app.base, newPlayer('hi'))
  await open(page, app.base, '#/?day=3')
  await audit(page, 'hi: L-wed cover')
  await open(page, app.base, '#/play?day=3')
  await audit(page, 'hi: L-wed play')
  await open(page, app.base, '#/play?day=12')
  await audit(page, 'hi: S-fri play')
  await open(page, app.base, '#/week?day=7')
  await audit(page, 'hi: week 1')
} catch (e) {
  record(T, 'threw', false, String(e))
} finally {
  await app.close()
}
const kinds = [...new Set(findings.map((f) => f.kind))]
record(T, `${seen.length} screens audited at 390, 320 and 1280 px`, seen.length >= 40, `${seen.length}`)
for (const k of ['contrast', 'target', 'no name', 'text under 12 px', 'sideways scroll', 'h1 count', 'heading skip', 'title', 'skip link needed', 'options not alike', 'axe', 'focus'])
  record(T, `no ${k} finding`, !kinds.includes(k), findings.filter((f) => f.kind === k).slice(0, 4).map((f) => `${f.screen} @${f.width}: ${f.detail}`).join(' | '))
mkdirSync(join(ROOT, 'out'), { recursive: true })
writeFileSync(join(ROOT, 'out/ux-audit.json'), JSON.stringify({ screens: seen, findings }, null, 2))
process.exit(summary() ? 0 : 1)
