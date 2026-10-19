/**
 * End to end against the emulator: a real browser plays a whole Game 2 session on the
 * Firebase store, and every frame the page sends is captured.
 *   AT-4: the network capture of a session shows no time field, and the session writes twice
 *         only (the token spent at the start; every record at submit), so the server never sees
 *         when an answer was given.
 *   AT-10: after the session, the device's storage holds no answer and no M3 label.
 *   AT-1: the same link opened again is refused.
 * Usage: pnpm e2e (firebase emulators:exec --only database,auth --project demo-eval 'tsx scripts/e2e.ts')
 */
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { createServer } from 'vite'
import { randomKey } from '../src/engine/rng'
import { marker, step } from './lib/autoplay'
import { record, summary } from './lib/check'
import { timeFields } from './no-timers'

const HOST = process.env.FIREBASE_DATABASE_EMULATOR_HOST
const PROJECT = process.env.GCLOUD_PROJECT ?? 'demo-eval'
if (!HOST || !PROJECT.startsWith('demo-')) {
  console.error('e2e runs only inside the emulator, on a demo- project: pnpm e2e')
  process.exit(1)
}
const NS = `${PROJECT}-default-rtdb`
const owner = async (method: string, path: string, body?: unknown) => {
  const r = await fetch(`http://${HOST}/${path}.json?ns=${NS}`, {
    method,
    headers: { authorization: 'Bearer owner' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return r.json() as Promise<unknown>
}
const ROOT = new URL('..', import.meta.url).pathname
const PORT = 5198
const DAY = 86_400_000

async function main() {
  await owner('DELETE', '')
  const now = Date.now()
  for (const dep of ['panel-g1', 'panel-g2', 'firm'])
    await owner('PUT', `eval-config/${dep}`, {
      releaseAt: now + 30 * DAY,
      deleteUntil: now + 44 * DAY,
    })
  const token = randomKey()
  await owner('PUT', `eval-tokens/${token}`, { dep: 'panel-g2', langs: 'en', s: 'issued' })

  process.env.VITE_STORE = 'emulator'
  const server = await createServer({
    root: ROOT,
    logLevel: 'silent',
    server: { port: PORT, strictPort: true },
    cacheDir: join(ROOT, 'node_modules/.vite-e2e'),
  })
  await server.listen()
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const frames: unknown[] = []
  /* The SDK splits a large message: a frame holding only a count, then that many pieces. */
  let pending = 0
  let buffer = ''
  page.on('websocket', (ws) =>
    ws.on('framesent', (f) => {
      const text = String(f.payload)
      if (pending > 0) {
        buffer += text
        pending -= 1
        if (pending === 0) frames.push(JSON.parse(buffer))
        return
      }
      if (/^\d+$/.test(text)) {
        pending = Number(text)
        buffer = ''
        return
      }
      try {
        frames.push(JSON.parse(text))
      } catch {
        /* keep-alive frames are not JSON */
      }
    }),
  )
  const posts: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET' && /9000|9099/.test(r.url())) posts.push(r.postData() ?? '')
  })
  try {
    page.on('console', (m) => m.type() === 'error' && console.log('browser:', m.text()))
    await page.goto(`http://localhost:${PORT}/#/play/${token}`)
    await page.waitForFunction(
      () => document.querySelector('[data-screen]')?.getAttribute('data-screen') !== 'loading',
      null,
      { timeout: 30000 },
    )
    for (let guard = 0; guard < 400; guard++) {
      const m = await marker(page)
      if (m === 'wrap:submit') break
      if (m?.endsWith(':code')) await page.locator('.code').waitFor({ timeout: 30000 })
      const before = await page.locator('[data-screen]').first().innerHTML()
      if (!(await step(page))) throw new Error(`stuck at ${m}`)
      await page
        .waitForFunction((b) => document.querySelector('[data-screen]')?.innerHTML !== b, before, {
          timeout: 20000,
        })
        .catch(() => {})
    }
    const writesBefore = frames.filter(
      (f) =>
        (f as { d?: { a?: string } }).d?.a === 'm' || (f as { d?: { a?: string } }).d?.a === 'p',
    ).length
    await step(page, { submit: true })
    await page.waitForSelector('[data-screen="finished"]', { timeout: 30000 })
    const writes = frames.filter((f) =>
      ['m', 'p'].includes((f as { d?: { a?: string } }).d?.a ?? ''),
    )
    const payloads = writes.map((f) => (f as { d: { b: { d: unknown } } }).d.b.d)
    record(
      'AT-4 no timers (emulator, browser network capture)',
      `the session wrote ${writes.length} times: once to spend the token, once to submit`,
      writesBefore === 1 && writes.length === 2,
      `${writesBefore} before submit`,
    )
    const tf = payloads.flatMap((p) => timeFields(p))
    record(
      'AT-4 no timers (emulator, browser network capture)',
      'no write the page sent carries a time field or an epoch value',
      tf.length === 0,
      tf.slice(0, 4).join(', '),
    )
    const sent = JSON.stringify(payloads)
    record(
      'AT-4 no timers (emulator, browser network capture)',
      'no write carries a timestamp placeholder ({".sv": "timestamp"})',
      !sent.includes('.sv'),
    )
    const stored = (await owner('GET', 'eval-play')) as Record<string, unknown> | null
    record(
      'AT-4 no timers (emulator, browser network capture)',
      'the records reached the emulator',
      !!stored && Object.keys(stored).length === 1,
    )

    const storage = await page.evaluate(async () => {
      const ls = JSON.stringify({ ...localStorage })
      const ss = JSON.stringify({ ...sessionStorage })
      const dbs = (await indexedDB.databases?.()) ?? []
      const dump: string[] = []
      for (const d of dbs) {
        if (!d.name) continue
        const db = await new Promise<IDBDatabase>((res, rej) => {
          const r = indexedDB.open(d.name as string)
          r.onsuccess = () => res(r.result)
          r.onerror = () => rej(r.error)
        })
        for (const name of Array.from(db.objectStoreNames)) {
          const all = await new Promise<unknown[]>((res) => {
            const q = db.transaction(name).objectStore(name).getAll()
            q.onsuccess = () => res(q.result)
          })
          dump.push(JSON.stringify(all))
        }
        db.close()
      }
      return { ls, ss, idb: dump.join('\n'), names: dbs.map((d) => d.name) }
    })
    const all = storage.ls + storage.ss + storage.idb
    record(
      "AT-10 M3's device label (browser storage after a session)",
      'the device keeps no label: no "upper", "lower" or "not-engaged" in any storage',
      !/"(upper|lower|not-engaged)"/.test(all),
      storage.names.join(', '),
    )
    record(
      "AT-10 M3's device label (browser storage after a session)",
      'the device keeps no answer, card or code in any storage',
      !/xw-|"chars"|"cards"|eval-play/.test(all) && !all.includes(token),
    )

    await page.goto(`http://localhost:${PORT}/#/play/${token}`)
    await page.reload()
    await page.getByRole('alert').waitFor({ timeout: 20000 })
    record(
      'AT-1 one-time tokens (emulator, browser)',
      'opening the same link again is refused',
      /already been used/.test((await page.getByRole('alert').textContent()) ?? ''),
    )
  } finally {
    await browser.close()
    await server.close()
  }
}

await main().catch((e) => record('ERROR e2e', 'threw', false, String(e)))
process.exit(summary() ? 0 : 1)
