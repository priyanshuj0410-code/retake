import { TAKE, type Lang, type Step } from './data'
import type { Answer } from './steps/common'

// What the First take keeps, on this phone only (feature-set D11, D17, F-116): where the player is, their picks, the
// language and the sound switch; for an adult the birth date, and for someone under 18 only the day the game opens
// (D1) and whether "Wrong date?" was used. No times, no keystrokes, nothing sent (PRODUCT.md, Privacy).
export interface Saved {
  v: 1
  at: number
  answers: Record<string, Answer>
  lang: Lang
  sound: boolean
  birth?: string
  opens?: string
  retried?: boolean
}

export const KEY = 'retake.take'
/** A first visit speaks the phone's language (F-135): Hindi on a Hindi phone, else Hinglish, the default. */
const phoneLang = (): Lang => (typeof navigator !== 'undefined' && /^hi\b/i.test(navigator.language) ? 'hi' : 'mix')
const FRESH: Saved = { v: 1, at: 0, answers: {}, lang: phoneLang(), sound: true }

/** A first visit's state: nothing kept, the phone's language. */
export const fresh = (): Saved => ({ ...FRESH, answers: {}, lang: phoneLang() })

const STEPS: Record<string, Step> = Object.fromEntries(TAKE.flow.flatMap((s) => (s.type === 'step' ? [[s.id, s]] : [])))
const hash = (t: string) => {
  let h = 0x811c9dc5
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 0x01000193)
  return (h >>> 0).toString(36)
}
/** Each decision's content as a short hash: its kind, its limits and its people with their numbers and notes. A kept
 * answer carries the hash it was given under, so a re-export that changes a decision (a new kind, a moved note) drops
 * the old answer instead of mixing it into the reading. The Hindi and the question's wording are left out, so a
 * reworded line keeps the answers. */
export const SIG: Record<string, string> = Object.fromEntries(
  Object.values(STEPS).map((s) => [s.id, hash(JSON.stringify([s.kind, s.need, s.seats, s.max, s.chores?.map((c) => c[0]), s.people.map((p) => [p.en, p.vals, p.line?.[0]])]))]),
)

/** Whether a kept answer still fits its decision: the same content, the shape its kind commits, only its people. */
function fits(id: string, a: unknown): a is Answer {
  const s = STEPS[id]
  if (!s || !a || typeof a !== 'object') return false
  const x = a as Record<string, unknown>
  if (x.s !== undefined && x.s !== SIG[id]) return false
  const names = new Set(s.people.map((p) => p.en))
  const list = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((n) => typeof n === 'string' && names.has(n)) && new Set(v).size === v.length
  const slots = s.chores?.length ?? 0
  switch (s.kind) {
    case 'pick':
      return typeof x.pick === 'string' && names.has(x.pick)
    case 'checks':
      return list(x.set) && x.set.length >= 1 && x.set.length <= (s.max ?? 0)
    case 'team':
      return list(x.set) && x.set.length === s.need
    case 'rank':
    case 'order':
      return list(x.order) && x.order.length === names.size
    case 'split': {
      const chores = x.chores as Record<string, unknown> | null
      const given = x.given as Record<string, unknown> | null | undefined
      return (
        !!chores && typeof chores === 'object' &&
        Object.entries(chores).every(([n, k]) => names.has(n) && typeof k === 'number') &&
        (given === undefined ||
          (!!given && typeof given === 'object' && Object.keys(given).length === slots &&
            Object.entries(given).every(([j, n]) => +j >= 0 && +j < slots && typeof n === 'string' && names.has(n))))
      )
    }
  }
}

// the last state written or read, so a state another window wrote is not written back, and nothing is written twice
let last: string | null = null

export function load(): Saved {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Saved | null
    if (!s || s.v !== 1) return fresh()
    // one bad answer costs only itself, never the rest of the take
    const ok = (id: string, a: unknown) => {
      try {
        return fits(id, a)
      } catch {
        return false
      }
    }
    const answers = Object.fromEntries(Object.entries(s.answers && typeof s.answers === 'object' ? s.answers : {}).filter(([id, a]) => ok(id, a)))
    const lang = TAKE.langs.some(([k]) => k === s.lang) ? s.lang : phoneLang()
    return { ...fresh(), ...s, answers, lang, at: Number.isInteger(s.at) && s.at >= 0 ? s.at : 0 }
  } catch {
    return fresh()
  }
}

/** The state another window has just written (a `storage` event), taken as this window's own. */
export function adopt(): Saved {
  const s = load()
  last = JSON.stringify(s)
  return s
}

/** After another window's Delete all: a first visit here too, with nothing written back. */
export function freshElsewhere(): Saved {
  const s = fresh()
  last = JSON.stringify(s)
  return s
}

export function save(s: Saved) {
  const json = JSON.stringify(s)
  if (json === last) return
  last = json
  try {
    localStorage.setItem(KEY, json)
  } catch {
    // a full or blocked store: the take still plays, it just will not resume
  }
}

/** Whether this phone can keep anything (a private window, a blocked store): the birth date says so if not (SC-15). */
export function canKeep() {
  try {
    localStorage.setItem(`${KEY}.probe`, '1')
    localStorage.removeItem(`${KEY}.probe`)
    return true
  } catch {
    return false
  }
}

export function forget() {
  last = null
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing kept to remove
  }
}
