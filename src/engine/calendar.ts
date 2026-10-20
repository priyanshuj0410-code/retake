/**
 * Dates and the daily rotation. A day is a date in India (YYYY-MM-DD); the app never stores a
 * time. The skin alternates by ISO week parity (odd weeks Lugdi, even weeks Station), and the
 * content day is the skin's week (1 to 7 Lugdi, 8 to 14 Station) at that weekday, so the
 * fortnight of content in content/days repeats until more is written. The anchor fortnight,
 * 19 Oct to 1 Nov 2026 (ISO weeks 43 and 44), is the one the date override jumps through.
 */
export const ANCHOR = '2026-10-19'
const DAY = 86_400_000

const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`)
const fromMs = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export const addDays = (d: string, n: number) => fromMs(toMs(d) + n * DAY)
export const daysBetween = (a: string, b: string) => Math.round((toMs(b) - toMs(a)) / DAY)

/** 1 (Monday) to 7 (Sunday). */
export const weekday = (d: string) => ((new Date(toMs(d)).getUTCDay() + 6) % 7) + 1

/** The ISO week: the week holding the year's first Thursday is week 1. */
export function isoWeek(d: string): { year: number; week: number } {
  const t = new Date(toMs(d))
  t.setUTCDate(t.getUTCDate() + 4 - weekday(d))
  const year = t.getUTCFullYear()
  const week = Math.ceil(((t.getTime() - Date.UTC(year, 0, 1)) / DAY + 1) / 7)
  return { year, week }
}

export const weekKey = (d: string) => {
  const w = isoWeek(d)
  return `${w.year}-W${String(w.week).padStart(2, '0')}`
}

export const mondayOf = (d: string) => addDays(d, 1 - weekday(d))

export const skinOf = (d: string): 'lugdi' | 'station' =>
  isoWeek(d).week % 2 === 1 ? 'lugdi' : 'station'

/** The content day (1 to 14) a date plays. */
export const contentDayOf = (d: string) => (skinOf(d) === 'lugdi' ? 0 : 7) + weekday(d)

/** The date of content day n in the anchor fortnight. */
export const anchorDate = (n: number) => addDays(ANCHOR, n - 1)

/** Today in India, from the device clock. */
export const indiaToday = (now = Date.now()) => fromMs(now + 5.5 * 3_600_000)

const VALID = /^\d{4}-\d{2}-\d{2}$/
const OVERRIDE_KEY = 'elt:date'

/**
 * The prototype's date override: `?day=1..14` jumps to that day of the anchor fortnight,
 * `?date=YYYY-MM-DD` to any date, `?day=0` clears it. It is held for the browser tab
 * (sessionStorage), so moving between screens keeps the pretended date.
 */
export function readOverride(search: string): string | null {
  const q = new URLSearchParams(search)
  const day = q.get('day')
  const date = q.get('date')
  let value: string | null | undefined
  if (day !== null) value = Number(day) >= 1 && Number(day) <= 14 ? anchorDate(Number(day)) : null
  else if (date !== null) value = VALID.test(date) ? date : null
  try {
    if (value === undefined) return sessionStorage.getItem(OVERRIDE_KEY)
    if (value === null) sessionStorage.removeItem(OVERRIDE_KEY)
    else sessionStorage.setItem(OVERRIDE_KEY, value)
  } catch {
    /* blocked storage: the override lasts for this load only */
  }
  return value ?? null
}

export function clearOverride() {
  try {
    sessionStorage.removeItem(OVERRIDE_KEY)
  } catch {
    /* nothing held */
  }
}
