/**
 * `pnpm e2e`: the trainer end to end in Chrome at 390 px, through the accessible roles only.
 * A new player picks a language and a road name, plays all twelve puzzle days of the
 * fortnight (every mechanic), reloads mid-step and carries on, sees each day's result, keeps a
 * streak with one forgiven day, closes both Sunday weeks, and uses the board and friends.
 * Then: the saved state holds dates and choices only; a one-sided player shows a larger lean
 * than a consistent one, as a size only; the date override, the Hindi layer, press feedback
 * and the hit-stop.
 */
import type { Page } from 'playwright-core'
import { DAYS } from '../src/content'
import { anchorDate } from '../src/engine/calendar'
import { newPlayer, open, phone, seed, startApp } from './lib/app'
import { playDay } from './lib/bot'
import { record, summary } from './lib/check'

const T = 'E end to end in a browser'
const text = (p: Page) => p.locator('main').innerText()
const leanOf = async (p: Page, base: string) => {
  await open(p, base, '#/week?day=14')
  const t = await text(p)
  return Number(t.match(/Lean size[^\n]*\n?\s*(\d+)/)?.[1] ?? NaN)
}

const app = await startApp(5320)
try {
  const page = await phone(app.browser)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await seed(page, app.base, null)

  await open(page, app.base, '#/?day=1')
  await page.getByRole('radio', { name: 'English' }).click()
  await page.getByRole('heading', { level: 1, name: 'Pick your road name' }).waitFor()
  const first = page.getByRole('radiogroup').getByRole('radio').first()
  const handle = (await first.innerText()).trim()
  await first.click()
  await page.getByRole('button', { name: 'This is me' }).click()
  await page.getByRole('heading', { level: 1, name: 'Diwali Ki Raat' }).waitFor()
  record(T, 'a new player picks a language and a generated road name, and lands on today', (await text(page)).includes(handle), handle)

  const results: Record<number, string> = {}
  for (const d of DAYS.filter((x) => !x.sunday)) {
    if (d.n === 8) {
      await page.goto('about:blank')
      await page.goto(`${app.base}#/play?day=8`)
      await page.getByRole('radio', { name: 'Most urgent first' }).click()
      await page.getByRole('button', { name: 'Lock the rule' }).click()
      await page.getByRole('button', { name: /^Anita/ }).click()
      await page.reload()
      await page.getByRole('button', { name: /^Anita.*CNF/ }).waitFor({ timeout: 5000 })
      record(T, 'a reload mid-step carries on: the locked rule and the first ticket are still there', true)
      await page.getByRole('button', { name: 'Start again' }).click()
      for (const w of ['Anita', 'Vikram', 'Joseph', 'Meena']) await page.getByRole('button', { name: new RegExp(`^${w}`) }).click()
      await page.getByRole('button', { name: 'Issue the tickets' }).click()
      await page.getByRole('heading', { level: 2, name: /gossip column/ }).waitFor()
      await page.getByRole('slider').focus()
      await page.getByRole('slider').press('ArrowRight')
      await page.getByRole('button', { name: 'Lock my guess' }).click()
      await page.getByRole('heading', { level: 1, name: 'Arrived' }).waitFor()
    } else await playDay(page, app.base, anchorDate(d.n))
    results[d.n] = await text(page)
  }
  const kinds = new Set(DAYS.flatMap((d) => d.steps.map((s) => s.kind)))
  record(T, `every mechanic played end to end through the screens (${kinds.size}: ${[...kinds].join(', ')})`, kinds.size === 8)
  record(
    T,
    'each scored day shows its score as consistency plus practice, with clear numbers',
    DAYS.filter((d) => !d.sunday && !d.transfer).every((d) => /Score\s*\n?\s*\d+/.test(results[d.n]) && /Consistency/.test(results[d.n]) && /Practice/.test(results[d.n])),
  )
  record(T, 'day 1 shows the rule kept as a number', /Rule kept\s*\n?\s*100%/.test(results[1]), results[1].slice(0, 200))
  record(T, 'the returning twin shows a matched case (Thursday, Station week)', /Matching cases treated alike\s*\n?\s*1 of 1/.test(results[11]))
  const tr = DAYS.find((d) => d.transfer)!
  record(T, 'the transfer day gives no score and no feedback', /No score today/.test(results[tr.n]) && !/Consistency/.test(results[tr.n]))
  record(T, 'the crowd guess shows the sample figure, labelled as made up', /Sample crowd: 71% of 41,302 players\. Made up/.test(results[8]))

  await open(page, app.base, '#/?day=13')
  const today13 = await text(page)
  record(T, 'the streak counts the days played and forgives the missed Sunday', /Streak\s*\n?\s*12 days/.test(today13) && (await page.locator('[data-mark="forgiven"]').count()) === 1)

  for (const n of [7, 14]) {
    await open(page, app.base, `#/week?day=${n}`)
    await page.getByRole('button', { name: 'Close the week' }).click()
    await page.getByRole('button', { name: 'Week closed' }).waitFor()
  }
  const week = await text(page)
  record(T, 'the Sunday week shows practice, consistency, the lean size and a look back with no verdict', /Week score/.test(week) && /Lean size/.test(week) && /direction hidden/.test(week) && /What was different\?/.test(week) && /You chose/.test(week))
  record(T, 'no screen states a direction of lean', !/towards (women|men)|favou?r(ed|s|ing)? (women|men)|against (women|men)|lean(ed|s)? (towards|to)/i.test(Object.values(results).join('\n') + week))
  await page.getByRole('textbox', { name: /A note for yourself/ }).fill('The words did it.')
  await open(page, app.base, '#/?day=14')
  record(T, 'both Sundays closed: the streak is 14 days and the forgiven day is no longer needed', /Streak\s*\n?\s*14 days/.test(await text(page)))

  await open(page, app.base, '#/board?day=14')
  const board = await text(page)
  const rows = await page.locator('table').first().locator('tbody tr').count()
  record(T, 'the board: sample label, top ranks, your rank and top band, and no bottom list', /made up/.test(board) && /Your rank/.test(board) && /Top \d+%/.test(board) && rows === 12, `${rows} rows`)
  await page.getByRole('searchbox').fill('Ka')
  await page.getByRole('button', { name: 'Find' }).click()
  const add = page.getByRole('button', { name: /^Add / }).first()
  const friend = (await add.innerText()).replace(/^Add /, '')
  await add.click()
  await page.getByRole('button', { name: `Remove ${friend}` }).waitFor()
  record(T, 'a friend is found by road name, added and tracked', (await text(page)).includes(friend), friend)

  const saved = (await page.evaluate(() => localStorage.getItem('elt:v1'))) ?? ''
  const state = JSON.parse(saved) as { days: Record<string, unknown>; notes: Record<string, string> }
  const timey = /"(time|ms|duration|stamp|timestamp|elapsed|took|at[A-Z]\w*)"\s*:|\d{4}-\d{2}-\d{2}T\d|\b1[6-9]\d{11}\b/.test(saved)
  record(
    T,
    'the saved state holds play-day dates and choices only: no times, stamps or durations',
    Object.keys(state.days).every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)) && !timey && Object.keys(state.days).length === 14,
  )
  record(T, 'the private note is kept on this phone', Object.values(state.notes).includes('The words did it.'))
  const consistentLean = await leanOf(page, app.base)

  const other = await phone(app.browser)
  await seed(other, app.base, newPlayer())
  for (const d of DAYS.filter((x) => !x.sunday)) await playDay(other, app.base, anchorDate(d.n), 'lean')
  const oneSided = await leanOf(other, app.base)
  record(T, 'a one-sided player shows a larger lean size than a consistent one', oneSided > consistentLean, `${oneSided} vs ${consistentLean}`)

  await open(other, app.base, '#/?day=5')
  const ov = await other.getByRole('heading', { level: 1 }).innerText()
  await open(other, app.base, '#/dev')
  await other.getByRole('link', { name: /^Day 12 / }).click()
  await other.getByRole('heading', { level: 1, name: 'Chit Fund Committee' }).waitFor()
  record(T, 'the date override jumps to any of the 14 days (query and prototype menu)', /CHIT FUND KA RAAZ|Chit Fund Ka Raaz/i.test(ov))
  await other.getByRole('button', { name: 'भाषा: हिन्दी' }).click()
  await other.getByRole('heading', { level: 1, name: 'चिट फंड कमेटी' }).waitFor()
  record(T, 'the Hindi layer switches the whole screen, Devanagari included', /आज/.test(await other.locator('nav').innerText()))

  const moving = await phone(app.browser, { reduced: false })
  await seed(moving, app.base, newPlayer())
  await open(moving, app.base, '#/play?day=3')
  const dur = await moving.getByRole('button', { name: 'Confirm my choice' }).evaluate((b) => getComputedStyle(b).transitionDuration)
  await moving.getByRole('radio', { name: /^Kamla/ }).click()
  await moving.getByRole('button', { name: 'Confirm my choice' }).click()
  const stamped = await moving.locator('button[data-state="stamped"]').count()
  await moving.getByRole('heading', { level: 1, name: 'The End' }).waitFor()
  const reducedDur = await (async () => {
    const still = await phone(app.browser)
    await seed(still, app.base, newPlayer())
    await open(still, app.base, '#/play?day=13')
    return still.getByRole('button', { name: 'Send the team' }).evaluate((b) => getComputedStyle(b).transitionDuration)
  })()
  record(T, `press feedback inside 100 ms (${dur}); the commit holds a stamped hit-stop; reduced motion moves nothing (${reducedDur})`, dur.split(',').every((x) => parseFloat(x) <= 0.1) && stamped === 1 && reducedDur.split(',').every((x) => parseFloat(x) === 0))
  record(T, 'no script error on any screen', errors.length === 0, errors.slice(0, 3).join(' | '))
} catch (e) {
  record(T, 'threw', false, String(e))
} finally {
  await app.close()
}
process.exit(summary() ? 0 : 1)
