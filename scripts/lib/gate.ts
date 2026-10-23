/** The first visit's birth date (SC-15), answered as a player would: the three fields, then the main button. */
import type { Page } from 'playwright-core'

export async function passGate(page: Page, date: [string, string, string] = ['14', '08', '1990']) {
  await page.locator('.datefields input').first().waitFor()
  for (const [i, v] of date.entries()) await page.locator('.datefields input').nth(i).fill(v)
  await page.locator('.take .dock .main').click()
}
