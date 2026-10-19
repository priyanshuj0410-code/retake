import { FirebaseStore } from './firebase'
import { LocalStore, type Tree } from './local'
import type { Explanation, Store } from './types'

const KEY = 'eval-demo-store'

/** The demo clock: in demo mode `?now=2027-03-02` pretends a date, to show the release gates. Never in a live build. */
export function demoNow(): number {
  if (typeof location === 'undefined') return Date.now()
  const q =
    new URLSearchParams(location.hash.split('?')[1] ?? '').get('now') ??
    new URLSearchParams(location.search).get('now')
  return q ? Date.parse(`${q}T12:00:00+05:30`) : Date.now()
}

/** A date in India, as YYYY-MM-DD. */
export const iso = (ms: number) => new Date(ms + 5.5 * 3600_000).toISOString().slice(0, 10)
export const today = () => iso(demoNow())

export function makeStore(): Store {
  const kind = import.meta.env?.VITE_STORE ?? 'local'
  if (kind === 'emulator')
    return new FirebaseStore({
      apiKey: 'demo-key',
      projectId: 'demo-eval',
      databaseURL: 'http://127.0.0.1:9000/?ns=demo-eval-default-rtdb',
      emulator: { host: '127.0.0.1', dbPort: 9000, authPort: 9099 },
    })
  if (kind === 'firebase')
    return new FirebaseStore({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      projectId: 'the-equal-lens',
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    })
  return new LocalStore(
    demoNow,
    {
      load: () => {
        try {
          const s = localStorage.getItem(KEY)
          return s ? (JSON.parse(s) as Tree) : null
        } catch {
          return null
        }
      },
      save: (t) => {
        try {
          localStorage.setItem(KEY, JSON.stringify(t))
        } catch {
          /* private window or blocked storage: the demo keeps working in memory */
        }
      },
    },
    /* The scoring explanation is never in the bundle. The demo dev server serves it from
       content/, where the seed script also reads it for the emulator. */
    async () => {
      if (!import.meta.env?.DEV) return null
      try {
        const r = await fetch('/content/explanation.json')
        return r.ok ? ((await r.json()) as Explanation[]) : null
      } catch {
        return null
      }
    },
  )
}

export const store = makeStore()
export type { Store }
