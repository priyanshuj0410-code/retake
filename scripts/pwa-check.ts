/**
 * `pnpm pwa` (EVAL-7): the installable, offline app, in a real browser on a production build.
 *   - Chrome's installability check (the one Lighthouse reads, Page.getInstallabilityErrors)
 *     reports no error, and the manifest names Team season with 192, 512 and maskable icons.
 *   - The service worker precaches the shell, the fonts and every portrait, and caches nothing
 *     from another origin (Firebase included).
 *   - A season loaded once resumes offline: the same screen, words and faces after a reload with
 *     the network off, its portraits and fonts drawn from the cache.
 *   - A new version waits: "Update ready" appears and nothing reloads until the player taps
 *     Update; then the page reloads and the season resumes.
 */
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { build } from 'vite'
import { record, summary } from './lib/check'
import { playSeason } from './season-play'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'out/pwa-dist')
const PORT = 5199
const BASE = `http://localhost:${PORT}/`
const T = 'X-18 installable, offline, update on tap (production build)'
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

await build({ root: ROOT, logLevel: 'silent', build: { outDir: DIST, emptyOutDir: true } })
const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0])
  let file = join(DIST, path)
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html')
  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-cache',
  })
  res.end(readFileSync(file))
})
await new Promise<void>((r) => server.listen(PORT, r))

const sig = (page: Page) =>
  page.evaluate(() => ({
    screen: document.querySelector('[data-screen]')?.getAttribute('data-screen'),
    text: (document.querySelector('main') as HTMLElement | null)?.innerText ?? '',
    faces: [...document.querySelectorAll('.portrait img')]
      .map((e) => (e as HTMLImageElement).getAttribute('src'))
      .join('|'),
  }))

/* A persistent profile: Chrome refuses to install from an incognito context, which a plain
   Playwright context is. */
const profile = mkdtempSync(join(tmpdir(), 'team-season-pwa-'))
const context = await chromium.launchPersistentContext(profile, {
  channel: 'chrome',
  viewport: { width: 390, height: 844 },
})
const page = context.pages()[0] ?? (await context.newPage())
try {
  await page.goto(BASE)
  await page.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 30000 })

  const cdp = await context.newCDPSession(page)
  const inst = (await cdp.send('Page.getInstallabilityErrors')) as {
    installabilityErrors: { errorId: string }[]
  }
  record(
    T,
    "Chrome's installability check (as Lighthouse runs it) reports no error",
    inst.installabilityErrors.length === 0,
    inst.installabilityErrors.map((e) => e.errorId).join(', '),
  )
  const manifest = JSON.parse(readFileSync(join(DIST, 'manifest.webmanifest'), 'utf8')) as {
    name: string
    display: string
    start_url: string
    icons: { sizes: string; purpose: string }[]
  }
  record(
    T,
    'the manifest: Team season, standalone, start_url "./", icons at 192, 512 and maskable',
    manifest.name === 'Team season' &&
      manifest.display === 'standalone' &&
      manifest.start_url === './' &&
      manifest.icons.some((i) => i.sizes === '192x192') &&
      manifest.icons.some((i) => i.sizes === '512x512' && i.purpose === 'any') &&
      manifest.icons.some((i) => i.purpose === 'maskable'),
  )
  const head = await page.evaluate(() => ({
    apple: !!document.querySelector('link[rel="apple-touch-icon"]'),
    capable: !!document.querySelector('meta[name="apple-mobile-web-app-capable"]'),
    title: document
      .querySelector('meta[name="apple-mobile-web-app-title"]')
      ?.getAttribute('content'),
    theme: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
  }))
  record(
    T,
    'iOS: apple-touch-icon, apple-mobile-web-app-capable and title, and the theme colour',
    head.apple && head.capable && head.title === 'Team season' && head.theme === '#553286',
    JSON.stringify(head),
  )

  /* Play into week two, then go offline and reload. */
  let beats = 0
  await playSeason(page, BASE, async (m) => {
    if (m.startsWith('story:beat:')) beats += 1
    if (beats >= 8) throw new Error('STOP')
  }).catch((e: unknown) => {
    if (!String(e).includes('STOP')) throw e
  })
  const cached = await page.evaluate(async () => {
    const out: string[] = []
    for (const k of await caches.keys())
      for (const r of await (await caches.open(k)).keys()) out.push(r.url)
    return out
  })
  const origin = new URL(BASE).origin
  record(
    T,
    'the precache holds the shell, every font and every portrait, and nothing from another origin',
    cached.some((u) => u.endsWith('/index.html') || u === BASE) &&
      cached.filter((u) => u.includes('/fonts/')).length >= 8 &&
      cached.filter((u) => u.includes('/portraits/')).length >= 100 &&
      cached.every((u) => u.startsWith(origin)),
    `${cached.length} entries`,
  )
  const sw = readFileSync(join(DIST, 'sw.js'), 'utf8')
  record(
    T,
    'the worker passes every other origin (Firebase) to the network untouched',
    /url\.origin !== self\.location\.origin\) return/.test(sw) &&
      !/firebase/i.test(sw.replace(/\/\*[\s\S]*?\*\//g, '')),
  )
  const before = await sig(page)
  await context.setOffline(true)
  await page.reload()
  await page.waitForFunction(
    (s) => document.querySelector('[data-screen]')?.getAttribute('data-screen') === s,
    before.screen,
    { timeout: 30000 },
  )
  await page.waitForTimeout(400)
  const after = await sig(page)
  const drawn = await page.evaluate(async () => {
    await document.fonts.ready
    const imgs = [...document.querySelectorAll('.portrait img')] as HTMLImageElement[]
    return {
      imgs: imgs.length,
      ok: imgs.every((i) => i.complete && i.naturalWidth > 0),
      font: document.fonts.check('17px Literata'),
    }
  })
  record(
    T,
    'offline: a reload mid-season resumes the same screen, words and faces',
    JSON.stringify(before) === JSON.stringify(after) &&
      before.screen?.startsWith('story:') === true,
    `${before.screen} -> ${after.screen}`,
  )
  record(
    T,
    'offline: the portraits and the fonts come from the cache',
    drawn.imgs > 0 && drawn.ok && drawn.font,
    JSON.stringify(drawn),
  )
  await context.setOffline(false)

  /* A new version: the worker changes; the prompt appears and nothing reloads until a tap. */
  await page.evaluate(() => ((window as unknown as { __kept: number }).__kept = 1))
  writeFileSync(join(DIST, 'sw.js'), `${sw}\n// next version\n`)
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r?.update()))
  await page.getByRole('status').filter({ hasText: 'Update ready' }).waitFor({ timeout: 30000 })
  await page.waitForTimeout(1500)
  const kept = await page.evaluate(() => (window as unknown as { __kept?: number }).__kept === 1)
  record(T, 'a new version shows "Update ready" and does not reload on its own', kept)
  const screenBefore = (await sig(page)).screen
  await Promise.all([
    page.waitForEvent('load', { timeout: 30000 }),
    page.getByRole('button', { name: 'Update' }).click(),
  ])
  await page.waitForFunction(
    (s) => document.querySelector('[data-screen]')?.getAttribute('data-screen') === s,
    screenBefore,
    { timeout: 30000 },
  )
  record(T, 'tapping Update reloads once and the season resumes where it was', true)
} catch (e) {
  record(T, 'threw', false, String(e))
} finally {
  await context.close()
  rmSync(profile, { recursive: true, force: true })
  server.close()
}
process.exit(summary() ? 0 : 1)
