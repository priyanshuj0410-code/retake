/**
 * Results from the saved days: a day's result, a week's summary and the player's practice.
 * Everything here reads choices and play-day dates; the Sunday notes are never read.
 */
import { dayByN, twinHalves, type Day } from '../content'
import type { Saved } from '../store'
import { addDays, mondayOf } from './calendar'
import {
  components,
  consistency,
  leanSize,
  PRACTICE_PER_STEP,
  PRACTICE_SUNDAY,
  scorePair,
  scoreStep,
  type Part,
  type Unit,
} from './score'

const TWINS = ['T1', 'T2', 'T3']

interface Played {
  date: string
  day: Day
}

const playedDays = (s: Saved): Played[] =>
  Object.entries(s.days)
    .filter(([, r]) => r.done)
    .map(([date, r]) => ({ date, day: dayByN(r.n) }))
    .sort((x, y) => (x.date < y.date ? -1 : 1))

const practiceOf = (day: Day) => (day.sunday ? PRACTICE_SUNDAY : day.steps.length * PRACTICE_PER_STEP)

export const totalPractice = (s: Saved) =>
  playedDays(s).reduce((sum, p) => sum + practiceOf(p.day), 0)

export const puzzlesSolved = (s: Saved) =>
  playedDays(s).reduce((sum, p) => sum + p.day.steps.length, 0)

/** Every twin whose halves are both played, with the date the second one was played. */
function pairs(s: Saved) {
  const out: { id: string; date: string; units: Unit[]; parts: Part[] }[] = []
  for (const id of TWINS) {
    const { a, b } = twinHalves(id)
    if (!a || !b) continue
    const latest = (n: number) =>
      playedDays(s)
        .filter((p) => p.day.n === n)
        .map((p) => p.date)
        .pop()
    const da = latest(a.day.n)
    const db = latest(b.day.n)
    if (!da || !db) continue
    const ia = a.day.steps.indexOf(a.step)
    const ib = b.day.steps.indexOf(b.step)
    const ansA = s.days[da].answers[ia]
    const ansB = s.days[db].answers[ib]
    if (!ansA || !ansB) continue
    const r = scorePair(
      { day: a.day, step: a.step, answer: ansA },
      { day: b.day, step: b.step, answer: ansB },
    )
    out.push({ id, date: da > db ? da : db, ...r })
  }
  return out
}

function evidence(s: Saved, dates: ReadonlySet<string>) {
  const units: Unit[] = []
  const parts: Part[] = []
  let deferred = false
  let crowdOff: number | undefined
  const finished = new Set(pairs(s).map((p) => p.id))
  for (const p of playedDays(s)) {
    if (!dates.has(p.date)) continue
    p.day.steps.forEach((step, i) => {
      const a = s.days[p.date].answers[i]
      if (!a) return
      const r = scoreStep(p.day, step, a)
      units.push(...r.units)
      parts.push(...r.parts)
      deferred ||= r.deferred && !('twin' in step && step.twin && finished.has(step.twin.id))
      if (r.crowdOff !== undefined) crowdOff = r.crowdOff
    })
  }
  const done = pairs(s).filter((p) => dates.has(p.date))
  for (const p of done) {
    units.push(...p.units)
    parts.push(...p.parts)
  }
  return { units, parts, deferred, crowdOff, pairs: done.map((p) => p.id) }
}

export interface DayResult {
  played: boolean
  transfer: boolean
  practice: number
  consistency: number | null
  score: number
  comps: ReturnType<typeof components>
  deferred: boolean
  crowdOff?: number
}

export function dayResult(s: Saved, date: string): DayResult {
  const rec = s.days[date]
  const day = rec ? dayByN(rec.n) : null
  if (!rec?.done || !day)
    return { played: false, transfer: false, practice: 0, consistency: null, score: 0, comps: {}, deferred: false }
  const e = evidence(s, new Set([date]))
  const practice = practiceOf(day)
  const c = consistency(e.parts, null)
  return {
    played: true,
    transfer: !!day.transfer,
    practice,
    consistency: day.transfer ? null : c,
    score: practice + (day.transfer ? 0 : (c ?? 0)),
    comps: day.transfer ? {} : components(e.parts),
    deferred: e.deferred,
    crowdOff: e.crowdOff,
  }
}

export const weekDates = (date: string) => {
  const mon = mondayOf(date)
  return [...Array(7).keys()].map((i) => addDays(mon, i))
}

export interface WeekSummary {
  practice: number
  puzzles: number
  consistency: number | null
  lean: number | null
  score: number
  comps: ReturnType<typeof components>
}

export function weekSummary(s: Saved, date: string): WeekSummary {
  const dates = new Set(weekDates(date))
  const e = evidence(s, dates)
  const days = playedDays(s).filter((p) => dates.has(p.date))
  const practice = days.reduce((sum, p) => sum + practiceOf(p.day), 0)
  const lean = leanSize(e.units)
  const c = consistency(e.parts, lean)
  return {
    practice,
    puzzles: days.reduce((sum, p) => sum + p.day.steps.length, 0),
    consistency: c,
    lean,
    score: practice + (c ?? 0),
    comps: components(e.parts),
  }
}
