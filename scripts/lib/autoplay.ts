/**
 * Plays one screen of a session in a real browser, the way a person would, through the
 * accessible roles only (buttons by name, radios, checkboxes). Used by the screenshots and
 * the emulator end-to-end run.
 */
import type { Page } from 'playwright-core'

export const marker = (page: Page) =>
  page.locator('[data-screen]').first().getAttribute('data-screen')

async function clickFirst(page: Page, names: RegExp) {
  const buttons = page.getByRole('button', { name: names })
  const n = await buttons.count()
  for (let i = 0; i < n; i++) {
    const b = buttons.nth(i)
    if ((await b.isVisible()) && (await b.isEnabled())) {
      await b.click()
      return true
    }
  }
  return false
}

const NEXT =
  /^(Continue|Next|Confirm|I agree to take part|Aage badhein|Aage|Pakka karein|Main hissa lene ke liye sehmat hoon)$/

/** Answers the current screen and moves on. Returns false at a screen it does not advance (submit). */
export async function step(
  page: Page,
  opts: { submit?: boolean; withdraw?: boolean } = {},
): Promise<boolean> {
  const add = page.getByRole('button', { name: /^(Add one|Ek badhayein):/ })
  if ((await add.count()) > 0) {
    for (let guard = 0; guard < 20; guard++) {
      const b = add.first()
      if (!(await b.isEnabled())) break
      await b.click()
    }
  }
  const groups = page.locator('fieldset')
  const g = await groups.count()
  for (let i = 0; i < g; i++) {
    const radios = groups.nth(i).getByRole('radio')
    if ((await radios.count()) > 0 && !(await groups.nth(i).locator('input:checked').count()))
      await radios.nth(Math.min(1, (await radios.count()) - 1)).check()
    const boxes = groups.nth(i).getByRole('checkbox')
    if ((await boxes.count()) > 0 && !(await groups.nth(i).locator('input:checked').count()))
      await boxes.first().check()
  }
  if (opts.submit || opts.withdraw) {
    const name = opts.withdraw
      ? /^(Delete my answers|Mere jawab mita dein)$/
      : /^(Submit my answers|Mere jawab submit karein)$/
    if (await clickFirst(page, name)) return true
  } else if (
    (await page
      .getByRole('button', { name: /^(Submit my answers|Mere jawab submit karein)$/ })
      .count()) > 0
  )
    return false
  return clickFirst(page, NEXT)
}
