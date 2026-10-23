/*
 * Retake's service worker (EVAL-7, kept for the trainer in EVAL-13 and the First take in EVAL-18), written into dist/ by
 * scripts/pwa/plugin.ts with the build's file list and version. It precaches the app shell, the library's styles, fonts
 * and the pictures the steps use, so a take plays offline once loaded; the cutscene panels, the heaviest pictures, are
 * cached as each is first shown rather than on install, so installing costs a weak signal less. The team's demo at
 * /demo/ is a separate page and is never touched. index.html is network-first, so an update arrives on the
 * next load; everything else is cache-first from this version's precache. Only this origin's
 * GET requests are touched: Firebase (another origin) and anything cross-origin pass straight
 * to the network and are never cached. It never reads or writes localStorage, where the player's days
 * live, and a new version waits until the player taps "Update" (no reload mid-puzzle).
 */
const VERSION = '__VERSION__'
const PRECACHE = __PRECACHE__
// the turned-down build cached under elt-; activate clears those and every older Retake version
const CACHE = `retake-${VERSION}`
const SHELL = './index.html'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => (k.startsWith('elt-') || k.startsWith('retake-')) && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
  // pictures the page loaded before this worker was in charge (src/pwa.ts): cached as if served here
  if (event.data && event.data.type === 'CACHE_SEEN' && Array.isArray(event.data.urls)) {
    const urls = event.data.urls.filter((u) => {
      try {
        const url = new URL(u)
        return url.origin === self.location.origin && url.pathname.startsWith('/take/')
      } catch {
        return false
      }
    })
    event.waitUntil(
      caches.open(CACHE).then((c) =>
        Promise.all(urls.map((u) => c.match(u).then((hit) => hit || c.add(u).catch(() => {})))),
      ),
    )
  }
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/demo')) return
  const isShell =
    req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html')
  if (isShell) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            void caches.open(CACHE).then((c) => c.put(SHELL, copy))
          }
          return res
        })
        .catch(() => caches.match(SHELL, { cacheName: CACHE })),
    )
    return
  }
  event.respondWith(
    caches.match(req, { cacheName: CACHE, ignoreSearch: true }).then(
      (hit) =>
        hit ??
        fetch(req).then((res) => {
          if (res.ok && url.pathname.startsWith('/take/')) {
            const copy = res.clone()
            void caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})
