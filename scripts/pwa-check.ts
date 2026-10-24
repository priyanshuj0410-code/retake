/**
 * `pnpm pwa` (EVAL-7, rewritten for Retake's First take in EVAL-18): the installable, offline app, in a real browser
 * on production builds served with vercel.json's headers (scripts/lib/serve.ts), so the Content-Security-Policy is
 * in force throughout. Two real versions are built, A and B, which differ in their code and in the library's styles,
 * so a version switch is tested for real.
 *   - Install: Chrome's installability check and the manifest parse report nothing; the manifest names Retake with
 *     192, 512, maskable and SVG icons, no locked orientation, and light screenshots that match their stated sizes;
 *     the iPhone tags; the theme colour matches.
 *   - Cache: the shell (with its CSP), the styles, every font and the sound engines; a chapter's cutscene panels and
 *     every panel shown are kept in retake-pics; nothing from another origin.
 *   - A stalled signal: with the page's own request never answered, the installed app still opens at once.
 *   - Offline, after the team's demo was visited: the app opens as the app, on the same decision and language.
 *   - A new version (B): its toast shows in the chosen language, never over the main button or the "?" sheet; a
 *     reload before the tap still runs A, with A's styles; only the tap brings B, from one cache; files unchanged
 *     from A are not fetched again; a second window that did not tap gets its own working Update; offline with the
 *     browser's own cache cleared, B still opens.
 *   - No page error and no console error (a CSP refusal is one) anywhere in the run.
 */
import { appendFileSync, cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { build, type Plugin } from 'vite'
import { record, summary } from './lib/check'
import { passGate } from './lib/gate'
import { browserOpts, serve } from './lib/serve'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'out/pwa')
const LIVE = join(OUT, 'live')
const PORT = 5199
const BASE = `http://localhost:${PORT}/`
const T = 'W installable, offline, update on tap (production builds A and B, Vercel headers)'
const MARK_B = '/* pwa-check: version B */'

/** Marks a build as A or B in its code; B also changes the library's styles, which keep their file name. */
const mark = (v: 'A' | 'B'): Plugin => ({
  name: 'pwa-check-mark',
  transform: (code, id) => (id.endsWith('/src/main.tsx') ? `${code}\n;window.__build = '${v}'\n` : null),
  writeBundle: (opts) => {
    if (v === 'B') appendFileSync(join(opts.dir ?? '', 'take/library.css'), `\n${MARK_B}\n`)
  },
})
for (const v of ['A', 'B'] as const)
  await build({ root: ROOT, logLevel: 'silent', plugins: [mark(v)], build: { outDir: join(OUT, v), emptyOutDir: true } })
const deploy = (v: 'A' | 'B') => {
  rmSync(LIVE, { recursive: true, force: true })
  cpSync(join(OUT, v), LIVE, { recursive: true })
  cpSync(join(ROOT, 'site'), join(LIVE, 'demo'), { recursive: true })
}
deploy('A')
let stalled = false
const log: string[] = []
const server = await serve(LIVE, PORT, ROOT, { stall: () => stalled, log })

interface Manifest {
  name: string
  short_name: string
  display: string
  start_url: string
  id: string
  orientation?: string
  theme_color: string
  icons: { src: string; sizes: string; purpose: string; type: string }[]
  screenshots: { src: string; sizes: string; form_factor: string }[]
}
interface Flow { flow: { type: string; panels?: { pic: string }[] }[] }

/** The screen showing: the frame's label, its question and its language. */
const sig = (page: Page) =>
  page.evaluate(() => ({
    screen: document.querySelector('.take .app')?.getAttribute('aria-label') ?? '',
    q: document.querySelector('h1.q')?.textContent ?? '',
    lang: (document.querySelector('.take .app') as HTMLElement | null)?.dataset.cur ?? '',
  }))
const buildOf = (page: Page) => page.evaluate(() => (window as unknown as { __build?: string }).__build)
const cacheMap = (page: Page) =>
  page.evaluate(async () => {
    const out: Record<string, string[]> = {}
    for (const k of await caches.keys()) out[k] = (await (await caches.open(k)).keys()).map((r) => r.url)
    return out
  })
const overlaps = (page: Page, a: string, b: string) =>
  page.evaluate(([a, b]) => {
    const x = document.querySelector(a)?.getBoundingClientRect()
    const y = document.querySelector(b)?.getBoundingClientRect()
    if (!x || !y) return null
    return !(x.right <= y.left || y.right <= x.left || x.bottom <= y.top || y.bottom <= x.top)
  }, [a, b])
const toast = (page: Page) => page.locator('.toast[role="status"]')

/* A persistent profile: Chrome refuses to install from an incognito context, which a plain Playwright context is. */
const profile = mkdtempSync(join(tmpdir(), 'retake-pwa-'))
const context = await chromium.launchPersistentContext(profile, { ...browserOpts(), viewport: { width: 412, height: 915 } })
const page = context.pages()[0] ?? (await context.newPage())
const errors: string[] = []
const watch = (p: Page) => {
  p.on('pageerror', (e) => errors.push(String(e)))
  p.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
}
watch(page)
try {
  await page.goto(BASE)
  await passGate(page)
  await page.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 30000 })

  /* ---- installable ---- */
  const cdp = await context.newCDPSession(page)
  const inst = (await cdp.send('Page.getInstallabilityErrors')) as { installabilityErrors: { errorId: string }[] }
  record(T, "Chrome's installability check reports no error", inst.installabilityErrors.length === 0,
    inst.installabilityErrors.map((e) => e.errorId).join(', '))
  const parsed = (await cdp.send('Page.getAppManifest')) as { errors: { message: string }[] }
  record(T, 'the manifest parses with no error or warning', parsed.errors.length === 0, parsed.errors.map((e) => e.message).join('; '))
  const manifest = JSON.parse(readFileSync(join(LIVE, 'manifest.webmanifest'), 'utf8')) as Manifest
  const icon = (f: (i: Manifest['icons'][number]) => boolean) => manifest.icons.some((i) => f(i) && existsSync(join(LIVE, i.src)))
  record(T, 'the manifest: Retake, standalone, start_url and id "./", no locked orientation, icons at 192, 512, maskable and SVG',
    manifest.name === 'Retake' && manifest.short_name === 'Retake' && manifest.display === 'standalone' &&
      manifest.start_url === './' && manifest.id === './' && !manifest.orientation &&
      icon((i) => i.sizes === '192x192') && icon((i) => i.sizes === '512x512' && i.purpose === 'any') &&
      icon((i) => i.purpose === 'maskable') && icon((i) => i.type === 'image/svg+xml'))
  let shotBytes = 0
  const shotsOk = manifest.screenshots.length >= 1 && manifest.screenshots.every((s) => {
    const f = join(LIVE, s.src)
    if (!existsSync(f) || s.form_factor !== 'narrow') return false
    const b = readFileSync(f)   // a JPEG's size, from its first SOF marker
    shotBytes += b.length
    for (let i = 2; i < b.length - 8; i++)
      if (b[i] === 0xff && b[i + 1] >= 0xc0 && b[i + 1] <= 0xc2) return s.sizes === `${b.readUInt16BE(i + 7)}x${b.readUInt16BE(i + 5)}`
    return false
  })
  // Chrome fetches these on every visit to an installable page
  record(T, 'the install screenshots match their sizes and weigh under 250 KB together', shotsOk && shotBytes < 250_000, `${Math.round(shotBytes / 1000)} KB`)
  const head = await page.evaluate(() => ({
    apple: !!document.querySelector('link[rel="apple-touch-icon"]'),
    capable: !!document.querySelector('meta[name="apple-mobile-web-app-capable"]'),
    title: document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content'),
    theme: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
  }))
  record(T, 'iOS: apple-touch-icon, standalone and title tags; the theme colour matches the manifest',
    head.apple && head.capable && head.title === 'Retake' && head.theme?.toLowerCase() === manifest.theme_color.toLowerCase(),
    JSON.stringify(head))

  /* ---- play into chapter 1, in Hindi ---- */
  const shown = new Set<string>()
  for (let i = 0; i < 40 && !(await page.$('.take .app.is-step')); i++) {
    // a cutscene loads all its panels with its first one, so every panel of a cutscene reached counts as shown
    for (const src of await page.$$eval('.cutpanel img', (xs) => xs.map((x) => new URL((x as HTMLImageElement).src).pathname))) shown.add(src)
    await page.click('.dock .main')
    await page.waitForTimeout(100)
  }
  // the first decision, whatever its kind: a card, or rows until the button is ready (Station 1 is a crew of 2)
  if (await page.$('.tiles')) await page.click('.tiles .tile >> nth=0')
  for (let i = 0; i < 6 && (await page.$('.dock .main.is-wait')); i++) await page.click('.rows .row[aria-checked="false"] >> nth=0')
  await page.click('.dock .main')
  await page.waitForFunction(() => /^2 of /.test(document.querySelector('.take .app')?.getAttribute('aria-label') ?? ''))
  await page.click('[data-help]')
  await page.click('[data-set-lang="hi"]')
  await page.click('.helpsheet .close')
  const before = await sig(page)
  await page.waitForTimeout(800)   // the worker's caching of pictures handed to it settles

  /* ---- what is cached ---- */
  const caches1 = await cacheMap(page)
  const vA = Object.keys(caches1).find((k) => /^retake-[0-9a-f]{12}$/.test(k)) ?? ''
  const pre = caches1[vA] ?? []
  const at = (p: string) => pre.filter((u) => u.includes(p)).length
  record(T, 'the version cache holds the shell, the styles, every font and the sound engines',
    pre.includes(BASE) && at('/take/library.css') === 1 && at('/take/fonts/') >= 20 && at('/take/sound.js') === 1 &&
      pre.some((u) => /\/assets\/index-.*\.js$/.test(u)), `${vA}: ${pre.length} entries`)
  const shell = await page.evaluate(async (v) => (await (await caches.open(v)).match('./'))?.headers.get('content-security-policy') ?? '', vA)
  record(T, 'the cached shell keeps its Content-Security-Policy', shell.includes("script-src 'self'"))
  const pics = new Set((caches1['retake-pics'] ?? []).map((u) => new URL(u).pathname))
  const flow = (JSON.parse(readFileSync(join(ROOT, 'content/take/first-take.json'), 'utf8')) as Flow).flow
  const covers = flow.flatMap((s, i) => (s.type === 'cover' ? [i] : []))
  const chapter1 = flow.slice(covers[0], covers[1]).flatMap((s) => (s.panels ?? []).map((p) => p.pic))
  record(T, "every panel shown, the opening's included, and chapter 1's panels ahead are kept in retake-pics",
    shown.size > 0 && [...shown, ...chapter1].every((p) => pics.has(p)), `${shown.size} shown, ${chapter1.length} ahead, ${pics.size} kept`)
  record(T, 'nothing from another origin is cached', Object.values(caches1).flat().every((u) => u.startsWith(new URL(BASE).origin)))

  /* ---- a stalled signal: the page's own request never answered ---- */
  stalled = true
  const t0 = performance.now()
  await page.reload({ waitUntil: 'commit' })
  await page.locator('h1.q').waitFor({ timeout: 15000 })
  const ms = Math.round(performance.now() - t0)
  stalled = false
  record(T, 'a stalled signal: the app opens from its cache at once', ms < 3000 && JSON.stringify(await sig(page)) === JSON.stringify(before), `${ms} ms`)

  /* ---- offline, after the team's demo was visited ---- */
  await page.goto(`${BASE}demo/`)
  await page.locator('.demo .phone').first().waitFor()
  await context.setOffline(true)
  await page.goto(BASE)
  await page.locator('h1.q').waitFor({ timeout: 15000 })
  record(T, 'offline, after the demo: the app opens on the same decision, in Hindi', JSON.stringify(await sig(page)) === JSON.stringify(before))
  const drawn = await page.evaluate(async (seen) => {
    await document.fonts.ready
    const ok = await Promise.all(seen.map((u) => fetch(u).then((r) => r.ok, () => false)))
    return { ok: ok.every(Boolean), hind: document.fonts.check('700 15px Hind'), deva: document.fonts.check('700 15px Hind', 'नागसेन') }
  }, [...shown].slice(0, 3))
  record(T, 'offline: panels already seen and the fonts come from the cache', drawn.ok && drawn.hind && drawn.deva, JSON.stringify(drawn))
  await context.setOffline(false)

  /* ---- a new version, B ---- */
  const page2 = await context.newPage()
  watch(page2)
  await page2.goto(BASE)
  await page2.locator('h1.q').waitFor()
  deploy('B')
  log.length = 0
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r?.update()))
  await toast(page).filter({ hasText: 'नया वर्ज़न तैयार।' }).waitFor({ timeout: 30000 })
  await toast(page2).waitFor({ timeout: 30000 })
  const fetched = [...log]
  record(T, 'installing B fetches what changed and not what A already had',
    fetched.includes('/take/library.css') && !fetched.some((p) => p.startsWith('/take/fonts/') || p === '/take/sound.js' || p.startsWith('/take/worlds/')),
    `${fetched.length} requests`)
  record(T, 'B waits: its toast shows in the chosen language, and A still runs', (await buildOf(page)) === 'A')
  await page.click('[data-help]')
  record(T, 'the toast steps aside while the "?" sheet is open', (await toast(page).count()) === 0)
  await page.click('.helpsheet .close')
  await page.setViewportSize({ width: 844, height: 390 })
  await page.waitForTimeout(300)
  record(T, 'the toast never covers the main button (a phone on its side)', (await overlaps(page, '.toast', '.dock .main')) === false)
  await page.setViewportSize({ width: 412, height: 915 })
  await page.reload()
  await toast(page).waitFor({ timeout: 30000 })
  const cssA = await page.evaluate(() => fetch('/take/library.css').then((r) => r.text()))
  record(T, "a reload before the tap still runs A, with A's styles", (await buildOf(page)) === 'A' && !cssA.includes('pwa-check: version B'))
  await Promise.all([page.waitForEvent('load', { timeout: 30000 }), page.locator('.toast .textbtn').click()])
  await page.locator('h1.q').waitFor()
  const caches2 = await cacheMap(page)
  const cssB = await page.evaluate(() => fetch('/take/library.css').then((r) => r.text()))
  record(T, 'the tap brings B from one cache, the take where it was',
    (await buildOf(page)) === 'B' && cssB.includes('pwa-check: version B') && JSON.stringify(await sig(page)) === JSON.stringify(before) &&
      Object.keys(caches2).filter((k) => k.startsWith('retake-') && k !== 'retake-pics').length === 1 && !(vA in caches2),
    Object.keys(caches2).join(', '))
  record(T, 'the kept pictures survive the update', (caches2['retake-pics'] ?? []).length >= pics.size)
  await page2.waitForTimeout(500)
  await Promise.all([page2.waitForEvent('load', { timeout: 30000 }), page2.locator('.toast .textbtn').click()])
  await page2.locator('h1.q').waitFor()
  record(T, "a second window's Update works after the first window's tap", (await buildOf(page2)) === 'B')
  await page2.close()

  await cdp.send('Network.clearBrowserCache')
  await context.setOffline(true)
  await page.reload()
  await page.locator('h1.q').waitFor({ timeout: 15000 })
  record(T, "offline with the browser's own cache cleared, B still opens", (await buildOf(page)) === 'B')
  await context.setOffline(false)

  const conf = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')) as Record<string, unknown>
  // Vercel's clean URLs redirect /index.html, and a redirected shell cannot open a page
  record(T, 'vercel.json keeps /index.html unredirected (no cleanUrls, no trailingSlash)', !('cleanUrls' in conf) && !('trailingSlash' in conf))
  record(T, 'no page error and no console error (a CSP refusal is one)', errors.length === 0, errors.slice(0, 3).join(' | '))
} catch (e) {
  record(T, 'threw', false, String(e))
} finally {
  await context.close()
  rmSync(profile, { recursive: true, force: true })
  server.close()
}
process.exit(summary() ? 0 : 1)
