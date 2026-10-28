import { addDays, daysBetween, isDate, weekday } from '../engine/calendar'
import { marks, streak, weekOf } from '../engine/streak'
import type { Step } from '../take/data'
import type { Answer } from '../take/steps/common'

// What the dailies keep, on this phone only (F-116): each puzzle's picks by puzzle date and level, with the hidden twin
// pairs its puzzle holds (for the holdback, F-49f), the level chosen, the kinds of puzzle met, the week notes, whether the
// level suggestion was shown, and play-day dates. No times: a play keeps its puzzle's date and the play day it was begun
// on, nothing finer. Sunday's look-again taps are never kept (F-69, F-77), only the optional note (F-70). The First take
// keeps its own store and counts for none of this (F-205).

export const LEVELS = ['easy', 'medium', 'hard'] as const
export type Level = (typeof LEVELS)[number]

/** One level of one day, as played. */
export interface Play {
  /** The puzzle's content id. */
  id: string
  /** Each committed step's answer, kept with the signature of the content it answered (s, stepSig). */
  answers: Record<string, Answer>
  done: boolean
  /** The play day it was begun on. The play stays bound to its puzzle's date, whenever it finishes (F-12). */
  begun: string
  /** Played on its own day: begun on it and finished within CARRY play days of it. Only these count for Today, This week
   * and the streak; a past puzzle adds to All time only (F-49a). */
  onDay: boolean
  /** The hidden twin pairs its puzzle holds one half of, so Past puzzles can hold back the other half (F-49f). */
  twins?: string[]
}

export interface Daily {
  v: 1
  /** Plays by puzzle date, then level. */
  days: Record<string, Partial<Record<Level, Play>>>
  /** The level chosen on the cover, remembered; new players start on Easy (F-211). */
  level: Level
  /** Whether the one level suggestion after the starter has been shown (F-211). */
  suggested: boolean
  /** The kinds of puzzle met, so each kind's demonstration plays once (F-25). */
  met: string[]
  /** Sundays whose week was opened on the day: each counts as that Sunday's day (F-66). */
  sundays: string[]
  /** The private notes by week (its Monday): nothing reads them but the note sheet (F-70). A cleared note is removed,
   * and an empty one reads as none. */
  notes: Record<string, string>
}

export const KEY = 'retake.daily'
/** A kept store this version cannot read (a newer version's, or a broken one), set aside before anything is written over
 * it, so an old build still open beside a new one never erases the new one's days (F-173a). Delete all clears it. */
export const UNREAD_KEY = 'retake.daily.unread'
/** The turned-down build's store (src/store/index.ts), which a phone from before 20 Oct may still hold. */
export const OLD_KEY = 'elt:v1'

/** The play days after its own that a play begun on its day may finish on and still count as that day (F-12): one, so
 * a day begun before 4 am finishes as that day; later it is a past puzzle, on All time only (F-49a). The owner to
 * confirm the window. */
export const CARRY = 1

/** A first visit's state: nothing played, on Easy. */
export const fresh = (): Daily => ({ v: 1, days: {}, level: 'easy', suggested: false, met: [], sundays: [], notes: {} })

const isLevel = (l: unknown): l is Level => LEVELS.includes(l as Level)
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const names = (v: unknown): v is string[] => Array.isArray(v) && v.every((n) => typeof n === 'string')

const hash = (t: string) => {
  let h = 0x811c9dc5
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 0x01000193)
  return (h >>> 0).toString(36)
}
/** A step's content as a short hash, the First take's recipe (src/take/store.ts, SIG): its kind, its limits and its
 * people with their numbers and notes, never the wording, so a reworded line keeps its answers and a changed decision
 * does not (F-173a). */
export const stepSig = (s: Step) =>
  hash(JSON.stringify([s.kind, s.need, s.seats, s.max, s.chores?.map((c) => c[0]), s.people.map((p) => [p.en, p.vals, p.line?.[0]])]))

/** A kept answer rebuilt from its known fields, before its puzzle is on hand: a content signature and one of the shapes
 * a step commits, or null. Any other field (a time from an old or edited store) is left behind, never saved again
 * (F-116); nothing the player chose is lost, so it is not reported. */
function shaped(a: unknown): Answer | null {
  if (!object(a)) return null
  const { s, pick, set, order, chores, given } = a
  if (typeof s !== 'string') return null
  if ('pick' in a) return pick === null || typeof pick === 'string' ? { pick, s } : null
  if ('set' in a) return names(set) ? { set, s } : null
  if ('order' in a) return names(order) ? { order, s } : null
  if (!object(chores) || !Object.values(chores).every((k) => typeof k === 'number')) return null
  if (given === undefined) return { chores: chores as Record<string, number>, s }
  return object(given) && names(Object.values(given))
    ? { chores: chores as Record<string, number>, given: given as Record<number, string>, s }
    : null
}

/** Whether a kept answer still fits its step as served now: the same content, the shape its kind commits, only its
 * people (the First take's check in src/take/store.ts, which reads the take's own steps, here for any puzzle's). */
function fits(s: Step, a: Answer): boolean {
  const x = a as Record<string, unknown>
  if (x.s !== stepSig(s)) return false
  const people = new Set(s.people.map((p) => p.en))
  const list = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((n) => typeof n === 'string' && people.has(n)) && new Set(v).size === v.length
  const slots = s.chores?.length ?? 0
  switch (s.kind) {
    case 'pick':
      return typeof x.pick === 'string' && people.has(x.pick)
    case 'checks':
      return list(x.set) && x.set.length >= 1 && x.set.length <= (s.max ?? 0)
    case 'team':
      return list(x.set) && x.set.length === s.need
    case 'rank':
    case 'order':
      return list(x.order) && x.order.length === people.size
    case 'split': {
      const chores = x.chores
      const given = x.given
      return (
        object(chores) && Object.entries(chores).every(([n, k]) => people.has(n) && typeof k === 'number') &&
        (given === undefined ||
          (object(given) && Object.keys(given).length === slots &&
            Object.entries(given).every(([j, n]) => +j >= 0 && +j < slots && typeof n === 'string' && people.has(n))))
      )
    }
  }
}

/** A kept play: a bad answer or twin list costs only itself; a play whose own fields are wrong is dropped whole, one
 * marked on its day though begun later included. */
function readPlay(date: string, v: unknown, path: string, dropped: string[]): Play | null {
  if (!object(v) || typeof v.id !== 'string' || !v.id || typeof v.done !== 'boolean' || !object(v.answers)) return null
  const { begun, onDay, twins } = v
  if (typeof begun !== 'string' || !isDate(begun) || begun < date || typeof onDay !== 'boolean' || (onDay && begun !== date))
    return null
  const answers: Record<string, Answer> = {}
  for (const [id, a] of Object.entries(v.answers)) {
    const kept = shaped(a)
    if (kept) answers[id] = kept
    else dropped.push(`${path}/${id}`)
  }
  if (twins !== undefined && !names(twins)) dropped.push(`${path}/twins`)
  return { id: v.id, answers, done: v.done, begun, onDay, ...(names(twins) && twins.length ? { twins } : {}) }
}

/** What a load found: the state, and every entry it dropped as unreadable, by path ("days/2026-10-28/easy"), so the
 * screen can say something was not kept (F-168). */
export interface Loaded {
  s: Daily
  dropped: string[]
}

/** A kept store, checked entry by entry: a bad entry costs only itself, never the rest, and a finished play keeps its
 * done mark when one of its answers is dropped (F-173a). */
export function parse(json: string | null): Loaded {
  const s = fresh()
  const dropped: string[] = []
  let x: unknown = null
  try {
    x = JSON.parse(json ?? 'null')
  } catch {
    dropped.push('store')
  }
  if (x === null) return { s, dropped }
  if (!object(x) || x.v !== 1) return { s, dropped: ['store'] }
  const entries = (v: unknown, name: string) => {
    if (v !== undefined && !object(v)) dropped.push(name)
    return Object.entries(object(v) ? v : {})
  }
  const list = (v: unknown, name: string, ok: (e: string) => boolean) => {
    if (v !== undefined && !Array.isArray(v)) dropped.push(name)
    const kept = new Set<string>()
    if (Array.isArray(v))
      v.forEach((e, i) => {
        if (typeof e === 'string' && ok(e)) kept.add(e)
        else dropped.push(`${name}/${i}`)
      })
    return [...kept]
  }

  for (const [date, levels] of entries(x.days, 'days')) {
    if (!isDate(date) || !object(levels)) {
      dropped.push(`days/${date}`)
      continue
    }
    for (const [level, p] of Object.entries(levels)) {
      const play = isLevel(level) ? readPlay(date, p, `days/${date}/${level}`, dropped) : null
      if (play) (s.days[date] ??= {})[level as Level] = play
      else dropped.push(`days/${date}/${level}`)
    }
  }
  if (isLevel(x.level)) s.level = x.level
  else if (x.level !== undefined) dropped.push('level')
  if (typeof x.suggested === 'boolean') s.suggested = x.suggested
  else if (x.suggested !== undefined) dropped.push('suggested')
  s.met = list(x.met, 'met', (k) => k !== '')
  s.sundays = list(x.sundays, 'sundays', (d) => isDate(d) && weekday(d) === 7)
  for (const [week, n] of entries(x.notes, 'notes'))
    if (!isDate(week) || weekday(week) !== 1 || typeof n !== 'string') dropped.push(`notes/${week}`)
    else if (n) s.notes[week] = n
  return { s, dropped }
}

// the last state this window passed to save, so nothing is written twice
let last: string | null = null
// the state this window last read, took or wrote: what another window has kept since is merged in against it
let base = fresh()
// whether the phone held this window's store when it last read or wrote it, so a missing one was deleted elsewhere
let held = false

/** Another window's kept state `k` and this window's `s`, both grown from `b` (what this window last read, took or
 * wrote), as one: what this window changed wins, the rest stays as the other window kept it, a finished play is never
 * replaced by an unfinished or missing one, and kinds met and Sundays are joined. */
function merge(b: Daily, k: Daily, s: Daily): Daily {
  const same = (x: unknown, y: unknown) => JSON.stringify(x) === JSON.stringify(y)
  const mine = <T>(was: T, theirs: T, now: T) => (same(now, was) ? theirs : now)
  const days: Daily['days'] = {}
  for (const date of new Set([...Object.keys(k.days), ...Object.keys(s.days)]))
    for (const l of LEVELS) {
      const theirs = k.days[date]?.[l]
      const now = s.days[date]?.[l]
      const p = theirs?.done && !now?.done ? theirs : (mine(b.days[date]?.[l], theirs, now) ?? theirs)
      if (p) (days[date] ??= {})[l] = p
    }
  const notes: Record<string, string> = {}
  for (const w of new Set([...Object.keys(k.notes), ...Object.keys(s.notes)])) {
    const n = mine(b.notes[w], k.notes[w], s.notes[w])
    if (n) notes[w] = n
  }
  return {
    v: 1,
    days,
    level: mine(b.level, k.level, s.level),
    suggested: k.suggested || s.suggested,
    met: [...new Set([...k.met, ...s.met])],
    sundays: [...new Set([...k.sundays, ...s.sundays])],
    notes,
  }
}

/** The kept state, read as this window's own. */
export function load(): Loaded {
  try {
    const kept = localStorage.getItem(KEY)
    const r = parse(kept)
    base = r.s
    held = kept !== null
    return r
  } catch {
    // a blocked store: nothing kept to read
    return { s: fresh(), dropped: [] }
  }
}

/** The state another window has just written (a `storage` event), taken as this window's own with nothing written
 * back, as the First take's adopt (src/take/store.ts) for Take.tsx's listener. */
export function adopt(): Loaded {
  const r = load()
  last = JSON.stringify(r.s)
  return r
}

/** After another window's Delete all: a first visit here too, with nothing written back. */
export function freshElsewhere(): Daily {
  base = fresh()
  last = JSON.stringify(base)
  held = false
  return fresh()
}

/** Keep the state, merged with whatever another window kept since this one last read or wrote (merge), so neither
 * loses the other's finished days. After another window's Delete all it writes nothing back and the screen takes
 * freshElsewhere on the storage event. A kept store this version cannot read is set aside first (UNREAD_KEY). False
 * when the phone cannot keep it (full or blocked), so the screen says so in place (F-168). */
export function save(s: Daily): boolean {
  const json = JSON.stringify(s)
  if (json === last) return true
  try {
    const kept = localStorage.getItem(KEY)
    if (kept === null && held) return true
    let out = json
    if (kept !== null && kept !== json) {
      const k = parse(kept)
      if (k.dropped.includes('store')) localStorage.setItem(UNREAD_KEY, kept)
      out = JSON.stringify(merge(base, k.s, s))
    }
    localStorage.setItem(KEY, out)
    last = json
    base = s
    held = true
    return true
  } catch {
    return false
  }
}

/** Delete all, with the First take's (src/take/store.ts forget): the dailies, any store set aside unread and the
 * turned-down build's store. */
export function forget() {
  last = null
  base = fresh()
  held = false
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(UNREAD_KEY)
    localStorage.removeItem(OLD_KEY)
  } catch {
    // nothing kept to remove
  }
}

const playOf = (s: Daily, date: string, level: Level): Play | undefined => s.days[date]?.[level]
const put = (s: Daily, date: string, level: Level, p: Play): Daily => ({
  ...s,
  days: { ...s.days, [date]: { ...s.days[date], [level]: p } },
})

/** Whether the phone's clock went back: a play day already kept (a play begun, a week opened) is later than `today`. */
const wentBack = (s: Daily, today: string) =>
  s.sundays.some((d) => d > today) || Object.values(s.days).some((l) => LEVELS.some((x) => (l[x]?.begun ?? '') > today))

/** Begin a level's puzzle on the play day `today`, keeping the twin pairs it holds. The play is bound to its puzzle's
 * date (F-12): begun on its own day it counts as that day if it finishes within CARRY (finish); a past day's is a past
 * puzzle (F-49a). A play already begun stays as it is, since each puzzle plays once, and tomorrow's puzzle cannot be
 * begun. `today` comes from the phone's clock (playDay), so a phone whose clock went back (wentBack) begins only past
 * puzzles and mends no gap (F-09); the full guard takes the day from the server with the puzzle (map item 8). */
export function begin(
  s: Daily,
  date: string,
  level: Level,
  puzzle: { id: string; twins?: readonly string[] },
  today: string,
): Daily {
  if (playOf(s, date, level) || date > today) return s
  const p: Play = { id: puzzle.id, answers: {}, done: false, begun: today, onDay: date === today && !wentBack(s, today) }
  return put(s, date, level, puzzle.twins?.length ? { ...p, twins: [...puzzle.twins] } : p)
}

/** Keep a step's answer with its content signature; a finished puzzle takes no more. */
export function commit(s: Daily, date: string, level: Level, step: Step, a: Answer): Daily {
  const p = playOf(s, date, level)
  if (!p || p.done) return s
  return put(s, date, level, { ...p, answers: { ...p.answers, [step.id]: { ...a, s: stepSig(step) } } })
}

/** The last step taken, on the play day `today`: done, still bound to its puzzle's date. Begun on its day, it counts as
 * that day when finished within CARRY play days of it (F-12), so 3:50 am to 4:10 am finishes as the day it began;
 * later it is a past puzzle, on All time only, so a puzzle begun and left never mends a gap (F-49a). */
export function finish(s: Daily, date: string, level: Level, today: string): Daily {
  const p = playOf(s, date, level)
  return p && !p.done ? put(s, date, level, { ...p, done: true, onDay: p.onDay && daysBetween(date, today) <= CARRY }) : s
}

/** The play to reopen (F-12): one begun on its own day, not finished, that can still finish as that day (today's, or
 * one begun before 4 am), the remembered level's first, then the older day, which closes first. Null when none. */
export function resume(s: Daily, today: string): { date: string; level: Level } | null {
  const open: { date: string; level: Level }[] = []
  for (let n = CARRY; n >= 0; n--) {
    const date = addDays(today, -n)
    for (const level of LEVELS) {
      const p = playOf(s, date, level)
      if (p && !p.done && p.onDay) open.push({ date, level })
    }
  }
  return open.find((x) => x.level === s.level) ?? open[0] ?? null
}

/** The step a play reopens on (F-12): its first step with no kept answer, or the end once every step has one. */
export function stepAt(p: Play, steps: readonly Step[]): number {
  const i = steps.findIndex((st) => !p.answers[st.id])
  return i < 0 ? steps.length : i
}

/** A play checked against its puzzle as served now (F-173a). A finished play stays finished whatever changed, and
 * `stale` names its steps whose content changed since. An unfinished play keeps the answers that still fit and moves to
 * the puzzle's current id; `dropped` names the rest, so the screen can say so (F-168). */
export function reconcile(
  s: Daily,
  date: string,
  level: Level,
  puzzle: { id: string; steps: readonly Step[] },
): { s: Daily; dropped: string[]; stale: string[] } {
  const p = playOf(s, date, level)
  if (!p) return { s, dropped: [], stale: [] }
  const steps = new Map(puzzle.steps.map((st) => [st.id, st]))
  const bad = Object.entries(p.answers)
    .filter(([id, a]) => {
      const st = steps.get(id)
      return !st || !fits(st, a)
    })
    .map(([id]) => id)
  if (p.done) return { s, dropped: [], stale: bad }
  if (!bad.length && p.id === puzzle.id) return { s, dropped: [], stale: [] }
  const answers = Object.fromEntries(Object.entries(p.answers).filter(([id]) => !bad.includes(id)))
  return { s: put(s, date, level, { ...p, id: puzzle.id, answers }), dropped: bad, stale: [] }
}

/** Opening the week on a Sunday's play day counts as that Sunday's day (F-66), never on a phone whose clock went back
 * (wentBack). Its look-again taps are never passed here or kept (F-69, F-77). */
export const openWeek = (s: Daily, today: string): Daily =>
  weekday(today) !== 7 || s.sundays.includes(today) || wentBack(s, today) ? s : { ...s, sundays: [...s.sundays, today] }

/** The play days that count for the streak and the week's marks: a day any level was played on its own day (F-210,
 * finish), and a Sunday whose week was opened on it (F-66). A past puzzle never counts (F-49a). */
export function playedDays(s: Daily): Set<string> {
  const d = new Set(s.sundays)
  for (const [date, levels] of Object.entries(s.days))
    if (LEVELS.some((l) => levels[l]?.done && levels[l]?.onDay)) d.add(date)
  return d
}

/** The streak, one missed day a week forgiven and today never breaking it (F-62, src/engine/streak.ts). */
export const streakOf = (s: Daily, today: string) => streak(playedDays(s), today)

/** This week's marks, Monday to Sunday: played, forgiven ("off"), missed, today or still to come (F-62). */
export const weekMarks = (s: Daily, today: string) => marks(playedDays(s), today)

/** Puzzles finished at each level, each level its own (F-92): Today and This week count own-day plays only, All time
 * counts past puzzles too (F-49a). */
export function counts(s: Daily, today: string) {
  const zero = (): Record<Level, number> => ({ easy: 0, medium: 0, hard: 0 })
  const c = { today: zero(), week: zero(), allTime: zero() }
  const week = new Set(weekOf(today))
  for (const [date, levels] of Object.entries(s.days))
    for (const l of LEVELS) {
      const p = levels[l]
      if (!p?.done) continue
      c.allTime[l]++
      if (p.onDay && date === today) c.today[l]++
      if (p.onDay && week.has(date)) c.week[l]++
    }
  return c
}

/** A puzzle the content lists: its date, its level, and the hidden twin pairs it holds one half of. Past puzzles need
 * every past puzzle listed; today's and later ones may be listed too and are never shown. */
export interface Listed {
  date: string
  level: Level
  twins?: readonly string[]
}

/** The days the other half of a twin pair stays out of Past puzzles once one half is played (F-49f). */
export const HOLD_DAYS = 7

/** Past puzzles (F-49a): the listed puzzles before today that this player has not finished, newest first. Once one
 * half of a hidden twin pair is played (begun), today's or a past one, the past day holding the other half is held back,
 * each of its levels not yet begun, since a day's three levels share one scene (F-210), for HOLD_DAYS from the play day
 * that half was begun, and nothing marks that it is held (F-49f). The played halves' pairs come from the plays
 * (Play.twins) as well as from `listed`, so a list of past days alone still holds back after today's half. */
export function pastPuzzles(s: Daily, today: string, listed: readonly Listed[]): Listed[] {
  const begun = new Map<string, string>()
  const half = (twins: readonly string[] | undefined, b: string) => {
    for (const t of twins ?? []) if (b > (begun.get(t) ?? '')) begun.set(t, b)
  }
  for (const p of Object.values(s.days).flatMap((levels) => LEVELS.flatMap((l) => levels[l] ?? []))) half(p.twins, p.begun)
  for (const x of listed) {
    const p = playOf(s, x.date, x.level)
    if (p) half(x.twins, p.begun)
  }
  const heldDays = new Set(
    listed
      .filter((x) => !playOf(s, x.date, x.level) && (x.twins ?? []).some((t) => {
        const b = begun.get(t)
        return !!b && daysBetween(b, today) < HOLD_DAYS
      }))
      .map((x) => x.date),
  )
  return listed
    .filter((x) => {
      const p = playOf(s, x.date, x.level)
      return x.date < today && (p ? !p.done : !heldDays.has(x.date))
    })
    .sort((a, b) => (a.date === b.date ? LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) : a.date < b.date ? 1 : -1))
}
