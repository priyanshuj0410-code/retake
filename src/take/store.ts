import type { Lang } from './data'
import type { Answer } from './steps/common'

// What the First take keeps, on this phone only (feature-set D11, D17): where the player is, their picks, the language
// and the sound switch. No times, no keystrokes, nothing sent (PRODUCT.md, Privacy).
export interface Saved {
  v: 1
  at: number
  answers: Record<string, Answer>
  lang: Lang
  sound: boolean
}

const KEY = 'retake.take'
const FRESH: Saved = { v: 1, at: 0, answers: {}, lang: 'mix', sound: true }

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

export function forget() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing kept to remove
  }
}
