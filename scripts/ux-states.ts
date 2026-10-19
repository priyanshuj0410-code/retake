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
        /* Icon buttons and rank numerals never hold words; everything else can. */
        if (
          n.textContent?.trim() &&
          !n.parentElement?.closest(
            'button[aria-label], span[aria-label], [aria-hidden="true"], [role="img"]',
          )
        )
          n.textContent = `${n.textContent} Zimmedaariyonwaalaaprabandhakpratinidhi Bahutlambaanaam`
    })
    main.after(clone)
    const wide = [...clone.querySelectorAll(`${sel}, ${sel} *`)]
      .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .map((el) => `${el.tagName}.${el.className}`)
      .slice(0, 4)
    const scroll = document.documentElement.scrollWidth - document.documentElement.clientWidth
    clone.remove()
    return { wide, scroll }
  }, sel)
  await page.setViewportSize({ width: 412, height: 915 })
  rec(
    component,
    'long content at 320 px',
    over.wide.length === 0 && over.scroll <= 0,
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

/** A radio or checkbox list: hover, checked (class and transition), checked plus focus, press. */
async function rows(page: Page, component: string, kind: 'radio' | 'checkbox') {
  const row = `.choice__option:has(input[type=${kind}])`
  const rowN = (n: number) => page.locator(row).nth(n)
  await page.mouse.move(0, 0)
  const before = await rowN(0).evaluate((e) => getComputedStyle(e).borderColor)
  await rowN(0).hover()
  await page.waitForTimeout(220)
  const over = await rowN(0).evaluate((e) => getComputedStyle(e).borderColor)
  await page.mouse.move(0, 0)
  rec(component, 'hover changes border-color', before !== over, `${before} -> ${over}`)
  await pressed(page, component, row)
  /* Two presses tick a checkbox twice; leave the row ticked. */
  if (!(await rowN(0).locator('input').isChecked())) await rowN(0).click()
  const checked = await rowN(0).evaluate((e) => ({
    cls: e.classList.contains('choice__option--checked'),
    dur: getComputedStyle(e).transitionDuration,
  }))
  rec(component, 'checked: row class (no :has needed)', checked.cls, JSON.stringify(checked))
  rec(
    component,
    'checked transition at the motion duration',
    /0\.16s/.test(checked.dur),
    checked.dur,
  )
  await motion(page, false)
  const still = await rowN(0).evaluate((e) => getComputedStyle(e).transitionDuration)
  await motion(page, true)
  rec(component, 'reduced motion: no transition', !/[1-9]/.test(still), still)
  await focusRing(page, component, `input[type=${kind}]`, 0)
  await forced(page, true)
  const fc = await rowN(0).evaluate((e) => getComputedStyle(e).outlineStyle)
  await forced(page, false)
  rec(component, 'forced colours: checked row outlined', fc === 'solid', fc)
  await stress(page, component, '.choice')
}

/** Holds a drag on the first row: lifted while held, settled after release. */
async function holdDrag(page: Page) {
  const h = page.locator('.sort__handle').first()
  const b = (await h.boundingBox())!
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(220)
  const held = await page
    .locator('.sort__row')
    .first()
    .evaluate((e) => ({
      cls: e.classList.contains('sort__row--dragging'),
      scale: getComputedStyle(e).transform,
      shadow: getComputedStyle(e).boxShadow,
    }))
  /* Drag down past the next row: the rows swap, and the others slide. */
  const rowH = (await page.locator('.sort__row').nth(1).boundingBox())!.height
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + rowH + 20, { steps: 6 })
  const sliding = await page
    .locator('.sort__row')
    .evaluateAll((rs) => rs.filter((r) => r.getAnimations().length > 0).length)
  await page.mouse.up()
  await page.waitForTimeout(400)
  const rowsAfter = await page
    .locator('.sort__row')
    .evaluateAll((rs) =>
      rs.map((r) => `${r.className}|${getComputedStyle(r).transform}|${r.getAnimations().length}`),
    )
  const settled = rowsAfter.every((r) => !r.includes('dragging') && r.includes('|none|'))
  return { held: { ...held, scale: scaleOf(held.scale) }, sliding, settled, rowsAfter }
}

async function sortList(page: Page) {
  const C = 'SortList'
  const enabled = '.sort__move:not([aria-disabled="true"])'
  await hover(page, C, enabled, 'background-color')
  await pressed(page, C, enabled)
  const live = await holdDrag(page)
  rec(
    C,
    'dragging: lifted (class, scale up, shadow)',
    live.held.cls && live.held.scale > 1 && live.held.shadow !== 'none',
    JSON.stringify(live.held),
  )
  rec(C, 'reorder: displaced rows slide (FLIP)', live.sliding > 0, `${live.sliding} rows animating`)
  rec(C, 'settle on drop: no lift left', live.settled, live.rowsAfter.join(' ; '))
  await motion(page, false)
  const still = await holdDrag(page)
  await motion(page, true)
  rec(
    C,
    'reduced motion: no lift scale, no slide',
    still.held.scale === 1 && still.sliding === 0,
    JSON.stringify({ ...still.held, sliding: still.sliding }),
  )
  /* The limit: Enter on the first row's up button keeps focus and says where the row is. */
  const reached = await tabTo(page, '.sort__move', 0)
  await page.keyboard.press('Enter')
  const after = await page.evaluate(() => ({
    kept: document.activeElement === document.querySelectorAll('.sort__move')[0],
    live: document.querySelector('.sort__live')?.textContent ?? '',
  }))
  rec(
    C,
    'aria-disabled at a limit: focus kept, position said again',
    reached && after.kept && /1/.test(after.live),
    JSON.stringify(after),
  )
  rec(
    C,
    'live wording: "<name>, position n of k" in lower case',
    /^[^,]+, position \d of \d\s?$/.test(after.live),
    after.live,
  )
  await focusRing(page, C, '.sort__move', 1)
  await forced(page, true)
  const off = await css(page, '.sort__move[aria-disabled="true"]', 'color')
  const on = await css(page, enabled, 'color')
  await forced(page, false)
  rec(C, 'forced colours: the limit button is distinct', off !== on, `${off} vs ${on}`)
  await stress(page, C, '.sort')
}

async function allocate(page: Page) {
  const C = 'Allocate'
  const plus = '.alloc__step:not([aria-disabled="true"])'
  await hover(page, C, plus, 'background-color')
  await pressed(page, C, '.alloc__step:nth-child(3)')
  for (let i = 0; i < 20 && !(await page.locator('.alloc__left--done').count()); i++)
    await page.locator('.alloc__step:nth-child(3)').first().click()
  const done = await page.locator('.alloc__left').evaluate((e) => ({
    cls: e.classList.contains('alloc__left--done'),
    tick: getComputedStyle(e, '::before').content,
    dur: getComputedStyle(e).transitionDuration,
    text: e.textContent,
  }))
  rec(
    C,
    '"All shared" arrives with a tick and the ok colour',
    done.cls && /✓/.test(done.tick),
    JSON.stringify(done),
  )
  rec(C, 'remaining count changes at the motion duration', /0\.16s/.test(done.dur), done.dur)
  const reached = await tabTo(page, '.alloc__step', 1)
  const before = await page.locator('.alloc__left').textContent()
  await page.keyboard.press('Enter')
  const after = await page.evaluate(() => ({
    kept: document.activeElement === document.querySelectorAll('.alloc__step')[1],
    live: document.querySelector('.alloc__left')?.textContent ?? '',
  }))
  rec(
    C,
    'aria-disabled at a limit: focus kept, the live line said again',
    reached && after.kept && after.live !== before && after.live.trim() === (before ?? '').trim(),
    JSON.stringify({ before, ...after }),
  )
  await focusRing(page, C, '.alloc__step', 0)
  await forced(page, true)
  const off = await css(page, '.alloc__step[aria-disabled="true"]', 'color')
  const on = await css(page, plus, 'color')
  await forced(page, false)
  rec(C, 'forced colours: a spent stepper is distinct', off !== on, `${off} vs ${on}`)
  await stress(page, C, '.alloc')
}

async function field(page: Page, base: string) {
  const C = 'Field'
  await page.goto(`${base}#/explain`)
  await page.reload()
  const input = page.getByRole('textbox')
  await input.waitFor()
  await page.mouse.move(0, 0)
  const rest = await input.evaluate((e) => getComputedStyle(e).borderColor)
  await input.hover()
  await page.waitForTimeout(220)
  const over = await input.evaluate((e) => getComputedStyle(e).borderColor)
  rec(C, 'hover changes border-color', rest !== over, `${rest} -> ${over}`)
  await focusRing(page, C, '.field__input')
  await page.waitForTimeout(220)
  const focus = await input.evaluate((e) => getComputedStyle(e).borderColor)
  rec(C, 'focus: accent border as well as the ring', focus !== rest, focus)
  await input.fill('NOT-A-CODE')
  await input.press('Enter')
  await page.getByRole('alert').waitFor()
  await page.waitForTimeout(220)
  const bad = await input.evaluate((e) => ({
    invalid: e.getAttribute('aria-invalid'),
    describedBy: document
      .getElementById(e.getAttribute('aria-describedby') ?? '')
      ?.getAttribute('role'),
    border: getComputedStyle(e).borderColor,
    alertBorder: getComputedStyle(document.querySelector('[role=alert]') as Element).borderColor,
  }))
  rec(
    C,
    'Enter submits; invalid is aria-invalid, described by the alert, error border',
    bad.invalid === 'true' && bad.describedBy === 'alert' && bad.border === bad.alertBorder,
    JSON.stringify(bad),
  )
  await input.press('Backspace')
  const cleared = await input.evaluate((e) => e.getAttribute('aria-invalid'))
  rec(C, 'typing again clears the invalid state', cleared === null, String(cleared))
  await stress(page, C, '.field')
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
    if (
      !done.has('Choice') &&
      (await page.locator('.choice__option:has(input[type=radio])').count()) > 1 &&
      !(await page.locator('input[type=radio]:checked').count())
    ) {
      done.add('Choice')
      await rows(page, 'Choice', 'radio')
    }
    if (
      !done.has('Checks') &&
      (await page.locator('.choice__option:has(input[type=checkbox])').count()) > 1 &&
      !(await page.locator('input[type=checkbox]:checked').count())
    ) {
      done.add('Checks')
      await rows(page, 'Checks', 'checkbox')
    }
    if (!done.has('Character') && (await page.locator('.character').count())) {
      done.add('Character')
      await stress(page, 'Character', '.character')
      await forced(page, true)
      const fig = await css(page, '.character__figure', 'forced-color-adjust')
      await forced(page, false)
      rec('Character', 'forced colours: the figure keeps its own colours', fig === 'none', fig)
    }
    if (!done.has('Statement') && (await page.locator('.statement').count())) {
      done.add('Statement')
      await stress(page, 'Statement', '.statement')
      await forced(page, true)
      const edge = await css(page, '.statement__box', 'border-top-style')
      await forced(page, false)
      rec('Statement', 'forced colours: both boxes keep their border', edge === 'solid', edge)
    }
    if (!done.has('Allocate') && (await page.locator('.alloc').count())) {
      done.add('Allocate')
      await allocate(page)
    }
    if (!done.has('SortList') && (await page.locator('.sort').count())) {
      done.add('SortList')
      await sortList(page)
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
  await field(page, base)
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
