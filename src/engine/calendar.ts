/**
 * Dates and the daily rotation. A day is a date in India (YYYY-MM-DD); the app never stores a
 * time. The dailies' play day changes at 4 am India time for everyone (F-08, F-09); the gate's
 * age check keeps the calendar date (indiaToday). Five worlds take a week each, in WORLDS order
 * and then again, with weeks counted from launch Monday, never by ISO week number, so the turn
 * never slips at New Year (F-214). Of the turned-down build's fortnight only its anchor stays,
 * 19 Oct to 1 Nov 2026 (ISO weeks 43 and 44), for the date override and scoring-check.
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

/** The five worlds in their turn, a week each (F-214). */
export const WORLDS = ['lugdi', 'station', 'jadugar', 'cricket', 'rukavat'] as const
export type World = (typeof WORLDS)[number]

/** Week 1 of the turn (F-214). A placeholder Monday: the owner sets the launch date. */
export const LAUNCH_MONDAY = '2026-11-02'

/** The week of the turn a date is in, counted from launch Monday (week 1). A date before launch is in week 1 too, so the
 * owner's play-through before launch plays launch week, in Lugdi, never a week 0 or the end of the turn. */
export const launchWeek = (d: string, launch = LAUNCH_MONDAY) =>
  Math.max(1, Math.floor(daysBetween(launch, d) / 7) + 1)

/** The Monday a date's own week starts on, counted in weeks from launch Monday, before launch too. */
export const weekStart = (d: string, launch = LAUNCH_MONDAY) =>
  addDays(launch, Math.floor(daysBetween(launch, d) / 7) * 7)

/** The world all three of a date's dailies are in (F-214); Lugdi before launch. */
export const worldOf = (d: string, launch = LAUNCH_MONDAY): World =>
  WORLDS[(launchWeek(d, launch) - 1) % WORLDS.length]

/** The date of content day n in the anchor fortnight. */
export const anchorDate = (n: number) => addDays(ANCHOR, n - 1)

/** Today in India, from the device clock. */
export const indiaToday = (now = Date.now()) => fromMs(now + 5.5 * 3_600_000)

/** The dailies' day in India, from the device clock: it changes at 4 am, not midnight (F-09). */
export const playDay = (now = Date.now()) => fromMs(now + (5.5 - 4) * 3_600_000)

const VALID = /^\d{4}-\d{2}-\d{2}$/

/** A real date in the YYYY-MM-DD form the stores keep. */
export const isDate = (d: string) => VALID.test(d) && !Number.isNaN(toMs(d)) && fromMs(toMs(d)) === d

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
