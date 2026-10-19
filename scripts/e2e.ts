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
import { playSeason } from './season-play'

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
  for (const dep of ['panel-g1', 'panel-g2', 'firm', 'season'])
    await owner('PUT', `eval-config/${dep}`, {
      releaseAt: now + 30 * DAY,
      deleteUntil: now + 44 * DAY,
    })
  const token = randomKey()
  await owner('PUT', `eval-tokens/${token}`, { dep: 'panel-g2', langs: 'en', s: 'issued' })
  const seasonToken = randomKey()
  await owner('PUT', `eval-tokens/${seasonToken}`, { dep: 'season', langs: 'en', s: 'issued' })

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

    /* Component states against the emulator's store (scripts/ux-states.ts checks the rest
       on the demo store): a wrong code on the withdrawal page, sent with Enter. */
    await page.goto(`http://localhost:${PORT}/#/withdraw`)
    await page.reload()
    const field = page.getByRole('textbox')
    await field.fill('AAAA-BBBB-CCCC')
    await field.press('Enter')
    await page.getByRole('alert').waitFor({ timeout: 20000 })
    const bad = await field.evaluate((e) => ({
      invalid: e.getAttribute('aria-invalid'),
      by: document.getElementById(e.getAttribute('aria-describedby') ?? '')?.getAttribute('role'),
    }))
    record(
      'X-9 component states (emulator, browser)',
      'Field: Enter sends the code; a wrong one is aria-invalid and described by the alert',
      bad.invalid === 'true' && bad.by === 'alert',
      JSON.stringify(bad),
    )
    await field.press('Backspace')
    record(
      'X-9 component states (emulator, browser)',
      'Field: typing again clears the invalid state',
      (await field.getAttribute('aria-invalid')) === null,
    )
    /* The season story (EVAL-4) on the real rules: its records, a profile and the
       stay-in-touch details are all accepted, and each holds only its whitelisted fields. */
    const T = 'X-14 season records (emulator, browser)'
    /* A reload resumes (owner, 19 Oct 2026): at week one, mid-episode and on the result, the
       same screen, words and faces come back (the same answers, the same draw). */
    const R = 'X-17 a reload resumes the season (emulator, browser)'
    const sig = () =>
      page.evaluate(() => ({
        screen: document.querySelector('[data-screen]')?.getAttribute('data-screen'),
        text: (document.querySelector('main') as HTMLElement | null)?.innerText ?? '',
        faces: [...document.querySelectorAll('.portrait')]
          .map(
            (e) =>
              `${e.getAttribute('aria-label')} ${e.querySelector('img')?.getAttribute('src') ?? ''}`,
          )
          .join('|'),
        act: document.querySelector('.page__act')?.textContent ?? '',
      }))
    const reloadSame = async (where: string) => {
      const a = await sig()
      await page.reload()
      await page.waitForFunction(
        (s) => document.querySelector('[data-screen]')?.getAttribute('data-screen') === s,
        a.screen,
        { timeout: 30000 },
      )
      await page.waitForTimeout(300)
      const b = await sig()
      const same = JSON.stringify(a) === JSON.stringify(b)
      record(
        R,
        `${where}: a reload comes back on the same screen with the same words, faces and answers`,
        same && !!a.screen && a.text.length > 0,
        same
          ? `${a.screen}`
          : `${a.screen} -> ${b.screen}; ${a.text.slice(0, 80)} | ${b.text.slice(0, 80)}`,
      )
    }
    let beats = 0
    let weekOne = false
    let midEpisode = false
    await page.goto('about:blank')
    let stopped = false
    await playSeason(page, `http://localhost:${PORT}/#/play/${seasonToken}`, async (m) => {
      /* Chapter 1's end: stop, reload (the season stays stopped), carry on: a new sitting. */
      if (m === 'story:saved' && !stopped) {
        stopped = true
        await page.getByRole('button', { name: 'Stop here, carry on later' }).click()
        await page.waitForSelector('[data-screen="story:stopped"]')
        await page.reload()
        await page.waitForSelector('[data-screen="story:stopped"]', { timeout: 30000 })
        record(R, 'a chapter end: "Stop here, carry on later" survives a reload', true)
        await page.getByRole('button', { name: 'Carry on now' }).click()
        await page.waitForSelector('[data-screen="story:saved"]')
        return
      }
      if (!m.startsWith('story:beat:')) return
      beats += 1
      const thenShown = (await page.locator('.then').count()) > 0
      if (!weekOne) {
        weekOne = true
        await reloadSame('week one (a mascot card)')
      } else if (!midEpisode && beats >= 12 && thenShown) {
        midEpisode = true
        await reloadSame('mid-episode (after the reveal, with the last consequence on screen)')
      }
    })
    record(
      R,
      'the reload points were reached (week one, mid-episode, a chapter end)',
      weekOne && midEpisode && stopped,
    )
    const sat = (await owner('GET', 'eval-play')) as Record<
      string,
      { meta: { dep: string; sit?: number } }
    > | null
    const sit = Object.values(sat ?? {}).find((p) => p.meta.dep === 'season')?.meta.sit
    record(
      R,
      'the record counts two sittings (the reopening at a chapter end), with no time',
      sit === 2,
      String(sit),
    )
    await reloadSame('the result')
    record(
      R,
      'the same link on a reload after submit shows the result, not a refusal',
      (await page.locator('[data-screen="story:result"]').count()) === 1 &&
        (await page.getByRole('alert').count()) === 0,
    )
    const fresh = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await fresh.goto(`http://localhost:${PORT}/#/play/${seasonToken}`)
    await fresh.getByRole('alert').waitFor({ timeout: 20000 })
    record(
      R,
      'on another device the submitted link is refused (one-time rule)',
      /already been used/.test((await fresh.getByRole('alert').textContent()) ?? ''),
    )
    await fresh.close()
    record(
      T,
      'a whole season plays to the result on the emulator',
      /Your answers are in/.test(await page.locator('main').innerText()),
    )
    const plays = (await owner('GET', 'eval-play')) as Record<
      string,
      { meta: { dep: string } }
    > | null
    record(
      T,
      'the rules accept the season records',
      Object.values(plays ?? {}).some((p) => p.meta.dep === 'season'),
    )
    await page.getByRole('textbox', { name: /display name/ }).fill('E2E')
    await page.getByRole('button', { name: 'Create my profile and save' }).click()
    await page.getByText(/Saved to E2E's profile/).waitFor({ timeout: 30000 })
    const profiles = (await owner('GET', 'eval-profile')) as Record<
      string,
      Record<string, string>
    > | null
    const box = Object.values(profiles ?? {})[0] ?? {}
    record(
      T,
      'the profile reaches the emulator as ciphertext only',
      Object.keys(profiles ?? {}).length === 1 &&
        Object.keys(box).sort().join(',') === 'ct,iv' &&
        !JSON.stringify(box).includes('E2E'),
    )
    await page.getByRole('textbox', { name: /Your email/ }).fill('e2e@example.test')
    await page.getByRole('checkbox').last().check()
    await page.getByRole('button', { name: 'Send my details' }).click()
    await page.getByText(/kept apart from your answers/).waitFor({ timeout: 30000 })
    const contacts = (await owner('GET', 'eval-contact')) as Record<
      string,
      Record<string, unknown>
    > | null
    const c = Object.values(contacts ?? {})[0] ?? {}
    record(
      T,
      'the stay-in-touch details reach the emulator with only the email and the two opt-ins',
      Object.keys(c).sort().join(',') === 'em,follow,research' &&
        c.research === true &&
        c.follow === false,
    )
  } finally {
    await browser.close()
    await server.close()
  }
}

await main().catch((e) => record('ERROR e2e', 'threw', false, String(e)))
process.exit(summary() ? 0 : 1)
