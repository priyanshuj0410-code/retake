/**
 * The trainer's store: this device only (localStorage), no backend. It holds the language,
 * the road name, friends' road names, the choices of each day keyed by its date, and the
 * private Sunday notes. It never holds a time: no response times, no keystrokes, no per-answer
 * stamps, only play-day dates (owner rule, Profile C as extended on 20 Oct 2026). The Backend
 * interface is where a server store would plug in for the real global board.
 */
import { useSyncExternalStore } from 'react'
import type { Answer } from '../engine/answers'
import type { Handle } from '../engine/handles'
import { freshSeed } from '../engine/rng'
import type { Lang } from '../content/types'

export interface DayRecord {
  /** The content day (1 to 14) this date played. */
  n: number
  answers: (Answer | null)[]
  /** The step the player is on, so a reload resumes it. */
  at: number
  done: boolean
}

export interface Saved {
  v: 1
  lang: Lang | null
  seed: number
  handle: Handle | null
  friends: string[]
  days: Record<string, DayRecord>
  /** Sunday notes by ISO week. Private: nothing reads them but the note box itself. */
  notes: Record<string, string>
}

export interface Backend {
  load(): Saved | null
  save(s: Saved): void
}

export const KEY = 'elt:v1'

const fresh = (): Saved => ({
  v: 1,
  lang: null,
  seed: freshSeed(),
  handle: null,
  friends: [],
  days: {},
  notes: {},
})

export const localBackend: Backend = {
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as Saved) : null
    } catch {
      return null
    }
  },
  save(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch {
      /* private window or full storage: play goes on in memory for this page */
    }
  },
}

let backend: Backend = localBackend
let state: Saved = backend.load() ?? fresh()
const subs = new Set<() => void>()

export const store = {
  get: () => state,
  update(f: (s: Saved) => Saved) {
    state = f(state)
    backend.save(state)
    for (const s of subs) s()
  },
  subscribe(f: () => void) {
    subs.add(f)
    return () => {
      subs.delete(f)
    }
  },
  reset() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* nothing stored */
    }
    state = fresh()
    for (const s of subs) s()
  },
  /** For the checks: a store in memory. */
  useBackend(b: Backend) {
    backend = b
    state = b.load() ?? fresh()
  },
}

export const useSaved = () => useSyncExternalStore(store.subscribe, store.get, store.get)

export const playedDates = (s: Saved) =>
  new Set(
    Object.entries(s.days)
      .filter(([, r]) => r.done)
      .map(([d]) => d),
  )
