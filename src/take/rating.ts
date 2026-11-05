// The one thing the app ever sends: the player's stars and optional line, when they tap Send after the take (EVAL-24).
// It goes to the shared Firebase database (firebase/retake.rules.json) by its plain REST address: no SDK, no sign-in, no
// cookies, and nothing about the player or their answers. vercel.json's connect-src names this one address and no other.
//
// The phone keeps only the record's random key, in its own entry, so Delete all can reach it (F-112). A key stays there
// until the database has confirmed its record is gone, and each opening tries again: "Not sent" can be a reply that was
// lost, so a key this phone tried is never forgotten, only withdrawn.

const DB = 'https://the-equal-lens-default-rtdb.asia-southeast1.firebasedatabase.app'
const NO_TRACE: RequestInit = { credentials: 'omit', referrerPolicy: 'no-referrer' }
const STORE = 'retake.rating'
const ID = /^[A-Za-z0-9_-]{22}$/

export const MAX_LINE = 140

/** The rating that stands (`mine`), and the keys whose records must go (`drop`). */
interface Keys {
  mine?: string
  drop: string[]
}
// a blocked store: the keys last only as long as the page
let held: Keys | null = null

function read(): Keys {
  if (held) return held
  try {
    const k = JSON.parse(localStorage.getItem(STORE) ?? 'null') as Partial<Keys> | null
    return { mine: typeof k?.mine === 'string' && ID.test(k.mine) ? k.mine : undefined, drop: Array.isArray(k?.drop) ? k.drop.filter((x) => typeof x === 'string' && ID.test(x)) : [] }
  } catch {
    return { drop: [] }
  }
}

function write(k: Keys) {
  try {
    if (k.mine || k.drop.length) localStorage.setItem(STORE, JSON.stringify(k))
    else localStorage.removeItem(STORE)
  } catch {
    held = k
  }
}

/** A record's key: 128 random bits, unguessable, and tied to nothing. */
export function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** The one write: the record, and the gate that admits it, spacing writes on the shared database. The record's day is
 * the phone's; the gate's time is the server's, and the next send replaces it. */
export function entry(id: string, stars: number, line: string, day: string) {
  const said = line.trim().slice(0, MAX_LINE)
  return { [`retake-feedback/${id}`]: { stars, ...(said ? { line: said } : {}), sent: day }, 'retake-feedback-gate': { at: { '.sv': 'timestamp' }, id } }
}

let running: Promise<boolean> | null = null

/** Asks the database to remove every record awaiting it; true when none is left. Each key stays until its record is
 * confirmed gone, for the next opening or the next signal. With none waiting, nothing goes out. */
export function flush(): Promise<boolean> {
  running ??= (async () => {
    const tried = new Set<string>()
    for (let id = read().drop[0]; id; id = read().drop.find((x) => !tried.has(x)) as string) {
      tried.add(id)
      try {
        const res = await fetch(`${DB}/retake-feedback/${id}.json?print=silent`, { ...NO_TRACE, method: 'DELETE', keepalive: true })
        if (res.ok) {
          const k = read()
          write({ ...k, drop: k.drop.filter((x) => x !== id) })
        }
      } catch {
        // no signal: it stays for next time
      }
    }
    return read().drop.length === 0
  })().finally(() => {
    running = null
  })
  return running
}

/** Takes back whatever this phone has sent or tried to send; true when the database has confirmed it. */
export function withdraw() {
  const k = read()
  if (k.mine) write({ drop: [...k.drop, k.mine] })
  return flush()
}

/** Sends the rating; true when the database has it and it still stands. */
export async function send(stars: number, line: string, day: string) {
  const id = newId()
  const k = read()
  // an earlier try may have landed with its reply lost, so only this new one will stand
  write({ mine: id, drop: k.mine ? [...k.drop, k.mine] : k.drop })
  void flush()
  let ok = false
  try {
    ok = (await fetch(`${DB}/.json?print=silent`, { ...NO_TRACE, method: 'PATCH', body: JSON.stringify(entry(id, stars, line, day)) })).ok
  } catch {
    // no signal, or the reply was lost: the key stays
  }
  // taken back while it was on its way: it may have landed after the delete, so it goes again
  if (read().mine !== id) {
    const now = read()
    if (!now.drop.includes(id)) write({ ...now, drop: [...now.drop, id] })
    void flush()
    return false
  }
  return ok
}
