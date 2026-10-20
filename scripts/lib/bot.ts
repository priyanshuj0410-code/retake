/**
 * A player for the browser checks: plays one day's puzzle through the accessible roles and
 * names only, as a screen-reader or keyboard user would reach them. `lean` picks the woman in
 * every tie and follows gender; the default plays consistently (its own locked rule, the same
 * words for both notes, the same answer to both halves of each mirror).
 */
import type { Page } from 'playwright-core'
import en from '../../content/i18n/en.json'
import { cast, dayByN, type Step, type Text } from '../../src/content'
import { contentDayOf } from '../../src/engine/calendar'

export type Policy = 'consistent' | 'lean'
const name = (who: string) => cast(who).name.en
const label = (t: Text) => t.en
const exact = (s: string) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
const starts = (s: string) => new RegExp(`^${s}`)

const COMMIT: Record<Step['kind'], string> = {
  assign: en['assign.commit'],
  pick: en['pick.commit'],
  checks: en['checks.commit'],
  team: en['team.commit'],
  rank: en['rank.commit'],
  words: en['words.commit'],
  swipe: en['swipe.commit'],
  crowd: en['crowd.commit'],
}

async function playStep(page: Page, step: Step, policy: Policy, each?: (s: Step, phase: string) => Promise<void>) {
  const radio = (n: string | RegExp) => page.getByRole('radio', { name: n }).first().click()
  const button = (n: string | RegExp) => page.getByRole('button', { name: n }).first().click()
  const prefer = (whos: string[]) =>
    [...whos].sort((x, y) =>
      policy === 'lean' ? (cast(x).gender === 'w' ? -1 : 1) - (cast(y).gender === 'w' ? -1 : 1) : 0,
    )
  switch (step.kind) {
    case 'assign': {
      const rule = step.rules[0]
      await radio(exact(label(rule.label)))
      await each?.(step, 'rule')
      await button(exact(en['assign.lock']))
      const key = (p: (typeof step.people)[number]) =>
        rule.key === 'sum' ? Object.values(p.values).reduce((a, b) => a + b, 0) : p.values[rule.key]
      const byKey = [...step.people].sort((a, b) => key(b) - key(a))
      const top = key(byKey[step.slots.length - 1])
      const sure = byKey.filter((p) => key(p) > top).map((p) => p.who)
      const tied = prefer(byKey.filter((p) => key(p) === top).map((p) => p.who))
      const chosen = [...sure, ...tied].slice(0, step.slots.length)
      for (const [i, who] of chosen.entries()) {
        await button(starts(name(who)))
        await button(exact(`${label(step.slots[i].label)}: ${en['assign.empty']}`))
      }
      break
    }
    case 'pick': {
      const people = step.options.filter((o) => o.who)
      const o =
        step.twin && policy === 'consistent'
          ? people.find((x) => x.profile === 'confident')!
          : people.find((x) => (policy === 'lean' ? cast(x.who!).gender === 'w' : true))!
      await radio(starts(name(o.who!)))
      break
    }
    case 'checks': {
      for (const p of step.people)
        await button(new RegExp(`: ${name(p.who)}, `))
      const third = step.people.find((p) => !p.mirror)!.who
      const chosen = policy === 'lean' ? step.people.find((p) => p.mirror && cast(p.who).gender === 'w')!.who : third
      await radio(exact(name(chosen)))
      break
    }
    case 'team': {
      const byValue = [...step.people].sort((a, b) => b.value - a.value)
      const cut = byValue[step.seats - 1].value
      const sure = byValue.filter((p) => p.value > cut).map((p) => p.who)
      const tied = prefer(byValue.filter((p) => p.value === cut).map((p) => p.who))
      for (const who of [...sure, ...tied].slice(0, step.seats))
        await page.getByRole('checkbox', { name: starts(name(who)) }).click()
      const r = policy === 'lean' && step.voice.target === 'm' ? 'comply' : 'ride'
      await radio(exact(label(step.responses.find((x) => x.id === r)!.label)))
      break
    }
    case 'rank': {
      const rule = step.rules![0]
      await radio(exact(label(rule.label)))
      await button(exact(en['rank.lock']))
      const order = [...step.people].sort(
        (a, b) =>
          b.values![rule.key] - a.values![rule.key] ||
          (policy === 'lean' ? (cast(a.who).gender === 'w' ? -1 : 1) : 0),
      )
      for (const p of order) await button(starts(name(p.who)))
      break
    }
    case 'words': {
      const good = step.bank.filter((b) => b.valence > 0)
      const bad = step.bank.filter((b) => b.valence < 0)
      const names = await page.$$eval('.note__blank', (els) => els.map((e) => e.getAttribute('aria-label') ?? ''))
      for (const n of names) {
        const who = step.people.find((p) => n.endsWith(name(p)))!
        const words = policy === 'lean' && cast(who).gender === 'm' ? bad : good
        const i = Number(n.match(/Blank (\d)/)![1]) - 1
        await page.getByRole('button', { name: exact(label(words[i].text)) }).click()
      }
      break
    }
    case 'swipe': {
      for (let i = 0; i < step.items.length; i++)
        await button(exact(label(policy === 'lean' ? step.keep : step.cut)))
      break
    }
    case 'crowd': {
      const s = page.getByRole('slider')
      await s.focus()
      for (let i = 0; i < 4; i++) await s.press('ArrowRight')
      break
    }
  }
  await each?.(step, 'ready')
  await page.getByRole('button', { name: exact(COMMIT[step.kind]) }).click()
}

/** Plays the day at `date` from its first step to its result. */
export async function playDay(
  page: Page,
  base: string,
  date: string,
  policy: Policy = 'consistent',
  each?: (s: Step, phase: string) => Promise<void>,
) {
  const day = dayByN(contentDayOf(date))
  await page.goto('about:blank')
  await page.goto(`${base}#/play?date=${date}`)
  await page.waitForSelector('h1')
  for (const step of day.steps) {
    await page.getByRole('heading', { level: 2, name: exact(label(step.prompt)) }).waitFor()
    await playStep(page, step, policy, each)
  }
  if (!day.sunday) await page.getByRole('heading', { level: 1, name: day.skin === 'lugdi' ? 'The End' : 'Arrived' }).waitFor()
  return day
}
