/**
 * `pnpm rules` (EVAL-24): Retake's piece of the shared ruleset, firebase/retake.rules.json, on the database emulator only,
 * never a real database. It sends what the app itself sends (src/take/rating.ts entry), by plain REST as the app does,
 * and holds what the rules allow and refuse.
 */
import { entry, newId } from '../src/take/rating'
import { record, summary } from './lib/check'

const T = 'F the rating on the shared database: firebase/retake.rules.json on the emulator'
const NS = 'demo-retake-default-rtdb'
const HOST = process.env.FIREBASE_DATABASE_EMULATOR_HOST ?? '127.0.0.1:9000'
const url = (path: string) => `http://${HOST}/${path}.json?ns=${NS}`
const NODE = 'retake-feedback'
const GATE = 'retake-feedback-gate'
const DAY = '2026-11-05'
const now = { '.sv': 'timestamp' }

const call = (method: string, path: string, body?: unknown, admin = false) =>
  fetch(url(path), { method, body: body === undefined ? undefined : JSON.stringify(body), headers: admin ? { Authorization: 'Bearer owner' } : {} })
const openGate = () => call('DELETE', GATE, undefined, true)
const write = (body: unknown) => call('PATCH', '', body).then((r) => r.status)
const stored = (path: string) => call('GET', path, undefined, true).then((r) => r.json())
/** A write as the app makes it, with the record's fields changed. */
const bad = (id: string, fields: Record<string, unknown>) => ({ [`${NODE}/${id}`]: { stars: 4, sent: DAY, ...fields }, [GATE]: { at: now, id } })

await call('DELETE', NODE, undefined, true)
await openGate()

const a = newId()
record(T, 'a key is 22 characters of the allowed alphabet', /^[A-Za-z0-9_-]{22}$/.test(a), a)
record(T, "the app's own write, with a line, is taken", (await write(entry(a, 5, '  Loved it.  ', DAY))) === 200)
const kept = await stored(`${NODE}/${a}`)
record(T, 'it holds the stars, the trimmed line and the day, and nothing else', JSON.stringify(Object.keys(kept).sort()) === '["line","sent","stars"]' && kept.stars === 5 && kept.line === 'Loved it.' && kept.sent === DAY, JSON.stringify(kept))
record(T, 'a second player inside 2 seconds is refused', (await write(entry(newId(), 3, '', DAY))) === 401)
await openGate()
const b = newId()
record(T, "the app's own write, with no line, is taken", (await write(entry(b, 1, '', DAY))) === 200)
record(T, 'with no line it holds no line', !('line' in (await stored(`${NODE}/${b}`))))
await openGate()
record(T, "a line of 140 Hindi letters is taken (the app's limit)", (await write(entry(newId(), 2, 'क'.repeat(140), DAY))) === 200)
await openGate()
record(T, 'a line longer than 140 is cut to 140 by the app', (await write(entry(newId(), 2, 'a'.repeat(400), DAY))) === 200)

const extra = newId()
const old = a
const refused: [string, () => Promise<number>][] = [
  ['no stars', () => write({ [`${NODE}/${extra}`]: { sent: DAY }, [GATE]: { at: now, id: extra } })],
  ['0 stars', () => write(bad(newId(), { stars: 0 }))],
  ['6 stars', () => write(bad(newId(), { stars: 6 }))],
  ['2.5 stars', () => write(bad(newId(), { stars: 2.5 }))],
  ['stars as words', () => write(bad(newId(), { stars: '5' }))],
  ['a line of 141', () => write(bad(newId(), { line: 'a'.repeat(141) }))],
  ['an empty line', () => write(bad(newId(), { line: '' }))],
  ['a line that is not words', () => write(bad(newId(), { line: 5 }))],
  ['any other field', () => write(bad(newId(), { answers: { 'station-1': 'x' } }))],
  ['a time in place of the day', () => write(bad(newId(), { sent: now }))],
  ['a day that is not a day', () => write(bad(newId(), { sent: 'yesterday' }))],
  ['hidden priority on the record', () => write({ [`${NODE}/${extra}`]: { stars: 4, sent: DAY, '.priority': 'x'.repeat(500) }, [GATE]: { at: now, id: extra } })],
  ['hidden priority on a field', () => write(bad(newId(), { stars: { '.value': 4, '.priority': 'x'.repeat(500) } }))],
  ['a short key anyone could guess', () => write(bad('abc', {}))],
  ['a key with other characters', () => write(bad('a~b'.padEnd(22, 'x'), {}))],
  ['two records in one write', () => {
    const [p, q] = [newId(), newId()]
    return write({ [`${NODE}/${p}`]: { stars: 4, sent: DAY }, [`${NODE}/${q}`]: { stars: 4, sent: DAY }, [GATE]: { at: now, id: p } })
  }],
  ['a record the gate does not name', () => write({ [`${NODE}/${newId()}`]: { stars: 4, sent: DAY }, [GATE]: { at: now, id: newId() } })],
  ['a record that does not move the gate', () => write({ [`${NODE}/${newId()}`]: { stars: 4, sent: DAY } })],
  ['the gate moved alone', () => write({ [GATE]: { at: now, id: newId() } })],
  ['the gate naming a record that already exists', () => write({ [GATE]: { at: now, id: old } })],
  ['the gate with a time the phone chose', () => write({ [`${NODE}/${extra}`]: { stars: 4, sent: DAY }, [GATE]: { at: 1, id: extra } })],
  ['the gate with another field', () => write({ [`${NODE}/${extra}`]: { stars: 4, sent: DAY }, [GATE]: { at: now, id: extra, x: 1 } })],
  ['writing over a record that exists', () => write(bad(old, { stars: 1 }))],
  ["another app's node in the same write", () => write({ ...entry(newId(), 4, '', DAY), 'spot/x': 1 })],
  ['replacing the whole node', () => call('PUT', NODE, { x: 1 }).then((r) => r.status)],
  ['deleting the whole node', () => call('DELETE', NODE).then((r) => r.status)],
  ['deleting the gate', () => call('DELETE', GATE).then((r) => r.status)],
]
for (const [what, go] of refused) {
  await openGate()
  const status = await go()
  record(T, `refused: ${what}`, status === 401, String(status))
}
for (const [what, path] of [['the node', NODE], ['one record', `${NODE}/${a}`], ['the gate', GATE], ['the root', '']] as const)
  record(T, `nobody can read ${what}`, (await call('GET', path)).status === 401)

const gone = await call('DELETE', `${NODE}/${b}`)
record(T, "whoever holds a record's key can delete it", gone.ok && (await stored(`${NODE}/${b}`)) === null)
record(T, 'deleting it again is harmless, so a lost reply can be retried', (await call('DELETE', `${NODE}/${b}`)).ok)
await openGate()
const before = Object.keys(await stored(NODE)).length
await write(entry(newId(), 4, '', DAY))
await openGate()
record(T, 'each accepted write adds exactly one record', Object.keys(await stored(NODE)).length === before + 1)

process.exit(summary() ? 0 : 1)
