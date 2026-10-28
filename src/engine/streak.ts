/**
 * The streak counts days played. One missed day in each ISO week is forgiven and shown as
 * forgiven, with its own shape and the word "off" (F-62, R-NUM-35), never hidden, but only when
 * the streak carried on over it: a missed day after the streak broke is missed. Today, not yet
 * played, never breaks it. It reads play-day dates only; which dates count is the caller's (the
 * dailies' store, src/daily/store.ts).
 */
import { addDays, daysBetween, weekKey, weekStart } from './calendar'

export type Mark = 'played' | 'forgiven' | 'missed' | 'today' | 'future'

export function streak(played: ReadonlySet<string>, today: string) {
  const forgiven = new Set<string>()
  const usedWeeks = new Set<string>()
  const first = [...played].sort()[0]
  /* A missed day waits as off until a day played before it carries the streak over it; at the break it is missed. */
  let waiting: string[] = []
  let count = 0
  for (let d = today; first && d >= first; d = addDays(d, -1)) {
    if (played.has(d)) {
      count++
      for (const f of waiting) forgiven.add(f)
      waiting = []
    } else if (d === today) continue
    else if (!usedWeeks.has(weekKey(d))) {
      usedWeeks.add(weekKey(d))
      waiting.push(d)
    } else break
  }
  return { count, forgiven }
}

/** The week the marks show: today's week of the turn, Monday to Sunday, one world (F-214). */
export const weekOf = (today: string) =>
  [...Array(7).keys()].map((i) => addDays(weekStart(today), i))

export function marks(played: ReadonlySet<string>, today: string) {
  const { forgiven } = streak(played, today)
  return weekOf(today).map((date): { date: string; mark: Mark } => {
    if (played.has(date)) return { date, mark: 'played' }
    if (date === today) return { date, mark: 'today' }
    if (daysBetween(today, date) > 0) return { date, mark: 'future' }
    return { date, mark: forgiven.has(date) ? 'forgiven' : 'missed' }
  })
}
