import type { Lang } from './data'
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

const KEY = 'retake.take'
/** A first visit speaks the phone's language (F-135): Hindi on a Hindi phone, else Hinglish, the default. */
const phoneLang = (): Lang => (typeof navigator !== 'undefined' && /^hi\b/i.test(navigator.language) ? 'hi' : 'mix')
const FRESH: Saved = { v: 1, at: 0, answers: {}, lang: phoneLang(), sound: true }

export function load(): Saved {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Saved | null
    return s && s.v === 1 ? { ...FRESH, ...s } : FRESH
  } catch {
    return FRESH
  }
}

export function save(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
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
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing kept to remove
  }
}
