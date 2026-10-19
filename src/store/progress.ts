/**
 * A season in progress, kept on this device only, so a reload resumes the same screen, answers
 * and draw (owner, 19 Oct 2026). It is never sent anywhere: the server still sees two writes,
 * the token spent at the start and every record at submit. In a browser it lives in
 * localStorage under its session key; without storage (a private window, the checks) it lives
 * in memory for the page's life.
 */
const PREFIX = 'eval-progress:'
const memory = new Map<string, string>()

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
  put(key: string, value: unknown) {
    const raw = JSON.stringify(value)
    memory.set(key, raw)
    try {
      storage()?.setItem(PREFIX + key, raw)
    } catch {
      /* blocked or full storage: the memory copy */
    }
  },
}
