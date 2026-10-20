/**
 * A season in progress, kept on this device only, so a reload resumes the same screen, answers
 * and draw (owner, 19 Oct 2026). It is never sent anywhere: the server still sees two writes,
 * the token spent at the start and every record at submit. In a browser it lives in
 * localStorage under its session key; without storage (a private window, the checks) it lives
 * in memory for the page's life.
 */
const PREFIX = 'eval-progress:'
const DAY = 86_400_000
const STAMP = '_savedAt'
const memory = new Map<string, string>()
/** Saves found expired on this page load, so asking twice gives the same answer. */
const expiredKeys = new Set<string>()

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export const progress = {
  get<V>(key: string): V | null {
    let raw: string | null = memory.get(key) ?? null
    try {
      raw = storage()?.getItem(PREFIX + key) ?? raw
    } catch {
      /* blocked storage: the memory copy */
    }
    try {
      return raw ? (JSON.parse(raw) as V) : null
    } catch {
      return null
    }
  },
  /**
   * The save, unless it is older than `maxDays`: then it is deleted unsent and `expired` is true
   * (EVAL-8). The time is kept on this device only, for the expiry, and never leaves it.
   */
  fresh<V>(key: string, maxDays: number, now = Date.now()): { value: V | null; expired: boolean } {
    if (expiredKeys.has(key)) return { value: null, expired: true }
    const v = progress.get<V & { [STAMP]?: number; finished?: unknown }>(key)
    if (v && !v.finished && v[STAMP] !== undefined && now - v[STAMP] > maxDays * DAY) {
      progress.drop(key)
      expiredKeys.add(key)
      return { value: null, expired: true }
    }
    return { value: v, expired: false }
  },
  put(key: string, value: object) {
    const raw = JSON.stringify({ ...value, [STAMP]: Date.now() })
    memory.set(key, raw)
    try {
      storage()?.setItem(PREFIX + key, raw)
    } catch {
      /* blocked or full storage: the memory copy */
    }
  },
  /** Every key this device holds a save under that starts with `prefix` (EVAL-12: the landing's resume). */
  keys(prefix: string): string[] {
    const out = new Set([...memory.keys()].filter((k) => k.startsWith(prefix)))
    try {
      const s = storage()
      for (let i = 0; s && i < s.length; i++) {
        const k = s.key(i)
        if (k?.startsWith(PREFIX + prefix)) out.add(k.slice(PREFIX.length))
      }
    } catch {
      /* blocked storage: the memory copies */
    }
    return [...out]
  },
  drop(key: string) {
    memory.delete(key)
    try {
      storage()?.removeItem(PREFIX + key)
    } catch {
      /* blocked storage: the memory copy is gone */
    }
  },
}
