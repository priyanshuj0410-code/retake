/**
 * The streak counts days played. One missed day in each ISO week is forgiven and shown as
 * forgiven (the red spine in Lugdi, the white ticket in Station), never hidden. Today, not yet
 * played, never breaks it. It reads play-day dates only.
 */
import { addDays, daysBetween, mondayOf, isoWeek, weekKey } from './calendar'

export type Mark = 'played' | 'forgiven' | 'missed' | 'today' | 'future'

export function streak(played: ReadonlySet<string>, today: string) {
  const forgiven = new Set<string>()
  const usedWeeks = new Set<string>()
  const first = [...played].sort()[0]
  let count = 0
  for (let d = today; first && d >= first; d = addDays(d, -1)) {
    if (played.has(d)) count++
    else if (d === today) continue
    else if (!usedWeeks.has(weekKey(d))) {
      usedWeeks.add(weekKey(d))
      forgiven.add(d)
    } else break
  }
  /* A forgiven day only counts as forgiven if the chain carried on before it. */
  for (const f of [...forgiven]) if (![...played].some((p) => p < f)) forgiven.delete(f)
  return { count, forgiven }
}

/** The fortnight the strip shows: the odd ISO week (Lugdi) and the even week after it. */
export function fortnightOf(today: string): string[] {
  const mon = mondayOf(today)
  const start = isoWeek(today).week % 2 === 1 ? mon : addDays(mon, -7)
  return [...Array(14).keys()].map((i) => addDays(start, i))
}

export function marks(played: ReadonlySet<string>, today: string) {
  const { forgiven } = streak(played, today)
  return fortnightOf(today).map((date): { date: string; mark: Mark } => {
    if (played.has(date)) return { date, mark: 'played' }
    if (date === today) return { date, mark: 'today' }
    if (daysBetween(today, date) > 0) return { date, mark: 'future' }
    return { date, mark: forgiven.has(date) ? 'forgiven' : 'missed' }
  })
}
