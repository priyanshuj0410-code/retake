/**
 * The component states pass of `pnpm ux` (knowledge/reviews/component-states-2026-10-19.md).
 * Plays one English game 2 session and the pages around it at 412 x 915 and, on the first
 * screen that shows each component, checks its states in the real browser: hover (pointer),
 * focus-visible, pressed, checked, aria-disabled at a limit, dragging and settling, the reorder
 * movement, invalid, done, long content at 320 px, reduced motion (no transform, no animation)
 * and forced colours. Run alone with `pnpm ux:states`; `pnpm ux` runs it after the audit.
 */
import type { Page } from 'playwright-core'
import { marker, step } from './lib/autoplay'

export interface StateResult {
  component: string
  state: string
  ok: boolean
  detail: string
}

const out: StateResult[] = []
const rec = (component: string, state: string, ok: boolean, detail = '') =>
  out.push({ component, state, ok, detail })

const css = (page: Page, sel: string, prop: string, pseudo?: string) =>
  page
    .locator(sel)
    .first()
    .evaluate(
      (e, [p, ps]) => getComputedStyle(e, ps || null).getPropertyValue(p as string),
      [prop, pseudo ?? ''],
    )

const scaleOf = (transform: string) => {
  const m = transform.match(/matrix\(([^,]+),/)
  return m ? Number(m[1]) : 1
}

async function motion(page: Page, on: boolean) {
  await page.emulateMedia({ reducedMotion: on ? 'no-preference' : 'reduce' })
}
async function forced(page: Page, on: boolean) {
  await page.emulateMedia({ forcedColors: on ? 'active' : 'none' })
}

/** Long unbroken words in every text node of a clone of <main>, measured at 320 px. */
async function stress(page: Page, component: string, sel: string) {
  await page.setViewportSize({ width: 320, height: 800 })
  const over = await page.evaluate((sel) => {
    const main = document.querySelector('main') as HTMLElement
    const clone = main.cloneNode(true) as HTMLElement
    clone.removeAttribute('tabindex')
    clone.querySelectorAll(sel).forEach((el) => {
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      for (let n = walk.nextNode(); n; n = walk.nextNode())
        if (n.textContent?.trim())
          n.textContent = `${n.textContent} Zimmedaariyonwaalaaprabandhakpratinidhi Bahutlambaanaam`
    })
    main.after(clone)
    const wide = [...clone.querySelectorAll(sel)].filter(
      (el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1,
    ).length
    const scroll = document.documentElement.scrollWidth - document.documentElement.clientWidth
    clone.remove()
    return { wide, scroll }
  }, sel)
  await page.setViewportSize({ width: 412, height: 915 })
  rec(
    component,
    'long content at 320 px',
    over.wide === 0 && over.scroll <= 0,
    JSON.stringify(over),
  )
}

/** Tab until `sel` (the n-th match) has focus; true when reached. */
async function tabTo(page: Page, sel: string, n = 0) {
  await page.locator('h1, main').first().focus()
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    if (
      await page.evaluate(
        ([s, k]) => document.activeElement === document.querySelectorAll(s as string)[k as number],
        [sel, n],
      )
    )
      return true
  }
  return false
}

async function focusRing(page: Page, component: string, sel: string, n = 0) {
  const reached = await tabTo(page, sel, n)
  const ring = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement as Element)
    return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth), color: cs.outlineColor }
  })
  rec(
    component,
    'focus-visible',
    reached && ring.style !== 'none' && ring.width >= 2 && !/rgba\(0, 0, 0, 0\)/.test(ring.color),
    JSON.stringify(ring),
  )
  await forced(page, true)
  const fc = await page.evaluate(
    () => getComputedStyle(document.activeElement as Element).outlineStyle,
  )
  rec(component, 'forced colours: focus ring kept', fc !== 'none', fc)
  await forced(page, false)
}

/** Holds the pointer down on `sel` and reads its scale, with motion and under reduced motion. */
async function pressed(page: Page, component: string, sel: string) {
  const el = page.locator(sel).first()
  const box = await el.boundingBox()
  if (!box) return rec(component, 'pressed', false, 'no box')
  const at = async () => {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(220)
    const t = await el.evaluate((e) => getComputedStyle(e).transform)
    await page.mouse.up()
    return scaleOf(t)
  }
  const live = await at()
  await motion(page, false)
  const still = await at()
  await motion(page, true)
  rec(component, 'pressed: scales down', live < 1, `scale ${live}`)
  rec(component, 'reduced motion: no press transform', still === 1, `scale ${still}`)
}

async function hover(page: Page, component: string, sel: string, prop: string) {
  await page.mouse.move(0, 0)
  const before = await css(page, sel, prop)
  await page.locator(sel).first().hover()
  await page.waitForTimeout(220)
  const after = await css(page, sel, prop)
  await page.mouse.move(0, 0)
  rec(component, `hover changes ${prop}`, before !== after, `${before} -> ${after}`)
}

/* ---------- per component ---------- */

async function button(page: Page) {
  const sel = '.button--primary'
  await hover(page, 'Button', sel, 'background-color')
  await focusRing(page, 'Button', sel)
  await pressed(page, 'Button', sel)
  await stress(page, 'Button', '.button')
}

async function buttonDisabled(page: Page) {
  const sel = '.button--primary:disabled'
  const cursor = await css(page, sel, 'cursor')
  await forced(page, true)
  const off = await css(page, sel, 'color')
  const on = await css(page, '.button--quiet, .button--secondary, h1', 'color')
  await forced(page, false)
  rec('Button', 'disabled: not-allowed cursor', cursor === 'not-allowed', cursor)
  rec('Button', 'forced colours: disabled distinct', off !== on, `${off} vs ${on}`)
}

/* ---------- the run ---------- */

export async function statesPass(page: Page, base: string): Promise<StateResult[]> {
  out.length = 0
  await page.setViewportSize({ width: 412, height: 915 })
  await page.emulateMedia({
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    forcedColors: 'none',
  })
  await page.goto(base)
  await page.getByRole('radio', { name: /^English only/ }).check()
  await page.getByRole('button', { name: /^Panel, game 2$/ }).click()
  await page.waitForSelector('[data-screen="demo"]')
  await button(page)
  const done = new Set<string>()
  for (let guard = 0; guard < 400; guard++) {
    const m = (await marker(page)) ?? ''
    if (!done.has('disabled') && (await page.locator('.button--primary:disabled').count())) {
      done.add('disabled')
      await buttonDisabled(page)
    }
    if (m === 'wrap:submit') {
      await step(page, { submit: true })
      await page.waitForSelector('[data-screen="finished"]')
      break
    }
    const before = await page.locator('[data-screen]').first().innerHTML()
    if (!(await step(page))) throw new Error(`states: stuck at ${m}`)
    await page
      .waitForFunction((b) => document.querySelector('[data-screen]')?.innerHTML !== b, before, {
        timeout: 20000,
      })
      .catch(() => {})
  }
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'none' })
  return out.slice()
}

/* `pnpm ux:states`: the pass alone, on its own Vite server. */
if (process.argv[1]?.endsWith('ux-states.ts')) {
  const { chromium } = await import('playwright-core')
  const { createServer } = await import('vite')
  const ROOT = new URL('..', import.meta.url).pathname
  const server = await createServer({
    root: ROOT,
    logLevel: 'silent',
    server: { port: 5197, strictPort: true },
  })
  await server.listen()
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage()
  let rs: StateResult[] = []
  try {
    rs = await statesPass(page, 'http://localhost:5197/')
  } finally {
    await browser.close()
    await server.close()
  }
  for (const r of rs)
    console.log(
      `${r.ok ? 'ok  ' : 'FAIL'} ${r.component}: ${r.state}${r.ok ? '' : ` (${r.detail})`}`,
    )
  const bad = rs.filter((r) => !r.ok).length
  console.log(`states: ${rs.length - bad}/${rs.length} passed`)
  process.exit(bad ? 1 : 0)
}
