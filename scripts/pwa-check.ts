/**
 * `pnpm pwa` (EVAL-7, rewritten for Retake's First take in EVAL-18): the installable, offline app, in a real browser
 * on a production build served with vercel.json's headers (scripts/lib/serve.ts), so the Content-Security-Policy is
 * in force throughout.
 *   - Chrome's installability check (Page.getInstallabilityErrors) reports no error and the manifest parses clean;
 *     the manifest names Retake with 192, 512, maskable and SVG icons, and screenshots that match their files.
 *   - iOS: the touch icon, standalone and title tags, and a theme colour that matches the manifest.
 *   - The service worker precaches the shell, the library's styles, every font and the sound engines; it caches a
 *     cutscene panel once shown, never on install; nothing from another origin.
 *   - Offline, a reload mid-take resumes the same decision with its words, faces and fonts, and a panel already
 *     seen still draws.
 *   - The team's demo at /demo/ never takes the app's place in the cache.
 *   - A new version waits: the toast appears, nothing reloads until Update is tapped, then the take resumes.
 *   - No page error and no console error (a CSP refusal is one) anywhere in the run.
 */
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { build } from 'vite'
import { record, summary } from './lib/check'
import { browserOpts, serve } from './lib/serve'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'out/pwa-dist')
const PORT = 5199
const BASE = `http://localhost:${PORT}/`
const T = 'W installable, offline, update on tap (production build, Vercel headers)'

interface Manifest {
  name: string
  short_name: string
  display: string
  start_url: string
  id: string
  theme_color: string
  icons: { src: string; sizes: string; purpose: string; type: string }[]
  screenshots: { src: string; sizes: string; form_factor: string }[]
}

await build({ root: ROOT, logLevel: 'silent', build: { outDir: DIST, emptyOutDir: true } })
cpSync(join(ROOT, 'site'), join(DIST, 'demo'), { recursive: true })
const server = await serve(DIST, PORT, ROOT)

/** The screen showing: the phone's label and its question or caption. */
const sig = (page: Page) =>
  page.evaluate(() => ({
    screen: document.querySelector('.take .app')?.getAttribute('aria-label') ?? '',
    q: document.querySelector('h1.q')?.textContent ?? '',
    lang: (document.querySelector('.take .app') as HTMLElement | null)?.dataset.cur ?? '',
  }))
const cachedUrls = (page: Page) =>
  page.evaluate(async () => {
    const out: string[] = []
    for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) out.push(r.url)
    return out
  })

/* A persistent profile: Chrome refuses to install from an incognito context, which a plain Playwright context is. */
const profile = mkdtempSync(join(tmpdir(), 'retake-pwa-'))
const context = await chromium.launchPersistentContext(profile, { ...browserOpts(), viewport: { width: 412, height: 915 } })
const page = context.pages()[0] ?? (await context.newPage())
const errors: string[] = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
try {
  await page.goto(BASE)
  await page.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 30000 })

  const cdp = await context.newCDPSession(page)
  const inst = (await cdp.send('Page.getInstallabilityErrors')) as { installabilityErrors: { errorId: string }[] }
  record(T, "Chrome's installability check reports no error", inst.installabilityErrors.length === 0,
    inst.installabilityErrors.map((e) => e.errorId).join(', '))
  const parsed = (await cdp.send('Page.getAppManifest')) as { errors: { message: string }[] }
  record(T, 'the manifest parses with no error or warning', parsed.errors.length === 0, parsed.errors.map((e) => e.message).join('; '))

  const manifest = JSON.parse(readFileSync(join(DIST, 'manifest.webmanifest'), 'utf8')) as Manifest
  const icon = (f: (i: Manifest['icons'][number]) => boolean) => manifest.icons.some((i) => f(i) && existsSync(join(DIST, i.src)))
  record(T, 'the manifest: Retake, standalone, start_url and id "./", icons at 192, 512, maskable and SVG, all present',
    manifest.name === 'Retake' && manifest.short_name === 'Retake' && manifest.display === 'standalone' &&
      manifest.start_url === './' && manifest.id === './' &&
      icon((i) => i.sizes === '192x192') && icon((i) => i.sizes === '512x512' && i.purpose === 'any') &&
      icon((i) => i.purpose === 'maskable') && icon((i) => i.type === 'image/svg+xml'))
  const shotsOk = manifest.screenshots.length >= 1 && manifest.screenshots.every((s) => {
    const f = join(DIST, s.src)
    if (!existsSync(f) || s.form_factor !== 'narrow') return false
    const b = readFileSync(f)   // a JPEG's size, from its first SOF marker
    for (let i = 2; i < b.length - 8; i++)
      if (b[i] === 0xff && b[i + 1] >= 0xc0 && b[i + 1] <= 0xc2) return s.sizes === `${b.readUInt16BE(i + 7)}x${b.readUInt16BE(i + 5)}`
    return false
  })
  record(T, 'the install dialog\'s screenshots exist, are narrow and match their stated sizes', shotsOk)

  const head = await page.evaluate(() => ({
    apple: !!document.querySelector('link[rel="apple-touch-icon"]'),
    capable: !!document.querySelector('meta[name="apple-mobile-web-app-capable"]'),
    title: document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content'),
    theme: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
  }))
  record(T, 'iOS: apple-touch-icon, standalone and title tags; the theme colour matches the manifest',
    head.apple && head.capable && head.title === 'Retake' && head.theme?.toLowerCase() === manifest.theme_color.toLowerCase(),
    JSON.stringify(head))

  /* Through the opening and the first cutscene to Station's first decision; pick, send, and on to the second. */
  const shown = new Set<string>()
  for (let i = 0; i < 40 && !(await page.$('.tiles')); i++) {
    // a cutscene loads all its panels with its first one, so every panel of a cutscene reached counts as shown
    for (const src of await page.$$eval('.cutpanel img', (xs) => xs.map((x) => (x as HTMLImageElement).src))) shown.add(src)
    await page.click('.dock .main')
    await page.waitForTimeout(100)
  }
  await page.click('.tiles .tile >> nth=0')
  await page.click('.dock .main')
  await page.waitForFunction(() => /^2 of /.test(document.querySelector('.take .app')?.getAttribute('aria-label') ?? ''))
  await page.click('[data-help]')
  await page.click('[data-set-lang="hi"]')
  await page.click('.helpsheet .close')
  const before = await sig(page)

  await page.waitForTimeout(500)   // the worker's caching of what loaded before it was in charge settles
  const cached = await cachedUrls(page)
  const origin = new URL(BASE).origin
  const at = (p: string) => cached.filter((u) => u.includes(p)).length
  record(T, 'the precache holds the shell, the styles, every font and the sound engines',
    cached.some((u) => u === BASE || u.endsWith('/index.html')) && at('/take/library.css') === 1 && at('/take/fonts/') >= 20 &&
      at('/take/sound.js') === 1 && cached.some((u) => /\/assets\/index-.*\.js$/.test(u)),
    `${cached.length} entries`)
  const cuts = cached.filter((u) => u.includes('/take/assets/cut-'))
  record(T, "every panel of a cutscene reached is cached, the opening's included, and none beyond",
    shown.size > 0 && [...shown].every((u) => cuts.includes(u)) && cuts.every((u) => shown.has(u)),
    `${shown.size} shown, ${cuts.length} cached`)
  record(T, 'nothing from another origin is cached', cached.every((u) => u.startsWith(origin)))

  /* The demo is visited online, then the network goes: the app must open from the cache as the app, not the demo. */
  await page.goto(`${BASE}demo/`)
  await page.locator('.demo .phone').first().waitFor()
  await context.setOffline(true)
  await page.goto(BASE)
  await page.locator('h1.q').waitFor({ timeout: 15000 })
  const after = await sig(page)
  record(T, 'offline, after the demo: the app opens from the cache on the same decision, in Hindi', JSON.stringify(before) === JSON.stringify(after),
    `${before.screen} -> ${after.screen}`)
  const drawn = await page.evaluate(async (seen) => {
    await document.fonts.ready
    const faces = [...document.querySelectorAll('.voice .av, .byline i')].map((e) => (e as HTMLElement).style.backgroundImage.replace(/^url\("?|"?\)$/g, ''))
    const ok = await Promise.all([...faces, seen].map((u) => fetch(u).then((r) => r.ok, () => false)))
    return { faces: faces.length, ok: ok.every(Boolean), hind: document.fonts.check('700 15px Hind'), deva: document.fonts.check('700 15px Hind', 'नागसेन') }
  }, [...shown][0])
  record(T, 'offline: the faces, a panel already seen and the fonts come from the cache', drawn.faces > 0 && drawn.ok && drawn.hind && drawn.deva,
    JSON.stringify(drawn))
  await page.reload()
  await page.locator('h1.q').waitFor({ timeout: 15000 })
  record(T, 'offline: a reload mid-take resumes the same decision', JSON.stringify(await sig(page)) === JSON.stringify(before))
  await context.setOffline(false)

  /* A new version: the worker changes; the toast appears and nothing reloads until a tap. */
  await page.evaluate(() => ((window as unknown as { __kept: number }).__kept = 1))
  const sw = readFileSync(join(DIST, 'sw.js'), 'utf8')
  writeFileSync(join(DIST, 'sw.js'), `${sw}\n// next version\n`)
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r?.update()))
  await page.locator('.toast[role="status"]').filter({ hasText: 'नया वर्ज़न तैयार।' }).waitFor({ timeout: 30000 })
  await page.waitForTimeout(1500)
  record(T, 'a new version shows its toast, in the chosen language, and does not reload on its own',
    await page.evaluate(() => (window as unknown as { __kept?: number }).__kept === 1))
  await Promise.all([page.waitForEvent('load', { timeout: 30000 }), page.locator('.toast .textbtn').click()])
  await page.locator('h1.q').waitFor()
  record(T, 'tapping Update reloads once and the take resumes where it was', JSON.stringify(await sig(page)) === JSON.stringify(before))

  const conf = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')) as Record<string, unknown>
  // Vercel's clean URLs redirect /index.html, and a redirected response cached as the shell cannot open offline
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
