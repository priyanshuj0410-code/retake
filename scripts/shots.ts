/**
 * `pnpm shots`: every screen of the fortnight at 390 px, full page, into out/trainer-shots/
 * (git-ignored), with index.txt listing them. A consistent player plays all 14 days; each step
 * is caught as it arrives and when it is ready to commit.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from 'playwright-core'
import { DAYS } from '../src/content'
import { anchorDate } from '../src/engine/calendar'
import { newPlayer, open, phone, seed, startApp } from './lib/app'
import { playDay } from './lib/bot'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'out/trainer-shots')
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const index: string[] = []
let k = 0
const shot = async (page: Page, name: string) => {
  const file = `${String(++k).padStart(3, '0')}-${name}.png`
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(OUT, file), fullPage: true })
  index.push(file)
}

const app = await startApp(5330)
try {
  const page = await phone(app.browser, { width: 390, height: 844 })
  await seed(page, app.base, null)
  await open(page, app.base, '#/?day=1')
  await shot(page, 'onboarding-language')
  await page.getByRole('radio', { name: 'English' }).click()
  await page.getByRole('radio').first().click()
  await shot(page, 'onboarding-road-name')
  await seed(page, app.base, newPlayer())
  for (const d of DAYS) {
    const date = anchorDate(d.n)
    await open(page, app.base, `#/?date=${date}`)
    await shot(page, `${String(d.n).padStart(2, '0')}-${d.id}-cover`)
    if (d.sunday) {
      await open(page, app.base, `#/week?date=${date}`)
      await page.getByRole('button', { name: 'Close the week' }).click()
      await shot(page, `${String(d.n).padStart(2, '0')}-${d.id}-week`)
      continue
    }
    await playDay(page, app.base, date, 'consistent', async (st, p) => {
      if (p !== 'rule') await shot(page, `${String(d.n).padStart(2, '0')}-${d.id}-${st.kind}-${p}`)
    })
    await shot(page, `${String(d.n).padStart(2, '0')}-${d.id}-result`)
  }
  await open(page, app.base, '#/board?day=14')
  await page.getByRole('searchbox').fill('Ka')
  await page.getByRole('button', { name: 'Find' }).click()
  await page.getByRole('button', { name: /^Add / }).first().click()
  await shot(page, 'board')
  await open(page, app.base, '#/dev')
  await shot(page, 'prototype-menu')
  await seed(page, app.base, newPlayer('hi'))
  for (const n of [3, 8, 12]) {
    await open(page, app.base, `#/play?day=${n}`)
    await shot(page, `hindi-day-${n}`)
  }
} finally {
  await app.close()
}
writeFileSync(join(OUT, 'index.txt'), `${index.join('\n')}\n`)
console.log(`${index.length} shots -> ${OUT}`)
