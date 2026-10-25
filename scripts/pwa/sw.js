/*
 * Retake's service worker (EVAL-7, kept for the trainer in EVAL-13 and the First take in EVAL-18), written into dist/ by
 * scripts/pwa/plugin.ts with the build's version, its precache list and its pictures, each with a revision (a hash of
 * the file). One version's files always go together: the shell, its hashed scripts, the library's styles, fonts and
 * the sound engines come from this version's own cache, and a new version arrives only when the player taps Update
 * (or every window has closed). Nothing waits on the network once installed, so a launch on a weak or stalled signal
 * opens at once.
 *   - Install copies every file whose revision is unchanged from the version before and fetches only what changed,
 *     revalidated past the browser's own cache, so an update costs a weak signal only its changes. Every file it
 *     fetches, and every picture it keeps, is checked against its revision first.
 *   - Pictures not needed on every phone (the cutscene panels, the larger and wide paintings) are cached when first
 *     shown, or ahead of a chapter (src/pwa.ts), in retake-pics, which updates keep: a picture is fetched again only
 *     when its revision changes.
 *   - Only '/' and '/index.html' are answered with the shell; any other page (the team's demo at /demo/, a picture
 *     opened on its own) goes to the network untouched, and nothing a page loads replaces the shell.
 *   - Only this origin's GET requests are touched; anything cross-origin passes straight to the network, never cached.
 *     It never reads or writes localStorage, where the player's take lives.
 */
const VERSION = '__VERSION__'
/** [url, revision] for every file this version precaches; './' is the shell. */
const PRECACHE = __PRECACHE__
/** path -> revision for the pictures cached when first shown. */
const PICS = __PICS__
// the turned-down build cached under elt-; activate clears those and every older Retake version
const CACHE = `retake-${VERSION}`
const PIC_CACHE = 'retake-pics'
const REVS = './__revisions__'

const picKey = (path) => `${path}?rev=${PICS[path]}`
const fresh = (url) => fetch(new Request(url, { cache: 'no-cache' }))
/** Whether a fetched file is the one this version names: its revision is the first 12 hex of its SHA-256
 * (scripts/pwa/plugin.ts), so a deploy that lands while this version installs can never pass its files for ours. */
const isRev = async (res, rev) => {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', await res.clone().arrayBuffer()))
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12) === rev
}
/** Keep a fetched picture, only if it is this version's. */
const keepPic = async (c, path, res) => {
  if (res.ok && (await isRev(res, PICS[path]))) await c.put(picKey(path), res)
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      // the newest earlier version that recorded its revisions, to copy what has not changed
      let old = null
      let oldRevs = {}
      for (const k of (await caches.keys()).reverse()) {
        if (!k.startsWith('retake-') || k === CACHE || k === PIC_CACHE) continue
        const c = await caches.open(k)
        const r = await c.match(REVS)
        if (r) {
          old = c
          oldRevs = await r.json()
          break
        }
      }
      await Promise.all(
        PRECACHE.map(async ([url, rev]) => {
          if (old && oldRevs[url] === rev) {
            const hit = await old.match(url)
            if (hit) return cache.put(url, hit)
          }
          const res = await fresh(url)
          // a redirected shell cannot open a page, and a failed file must not pass for this version's
          if (!res.ok || res.redirected) throw new Error(`precache ${url}: ${res.status}`)
          // another version's file (a deploy mid-install) fails this install; the browser tries again later
          if (!(await isRev(res, rev))) throw new Error(`precache ${url}: not revision ${rev}`)
          return cache.put(url, res)
        }),
      )
      await cache.put(REVS, new Response(JSON.stringify(Object.fromEntries(PRECACHE))))
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const k of await caches.keys())
        if ((k.startsWith('elt-') || k.startsWith('retake-')) && k !== CACHE && k !== PIC_CACHE) await caches.delete(k)
      // pictures this version no longer has, or has at another revision
      const pics = await caches.open(PIC_CACHE)
      const keep = new Set(Object.keys(PICS).map((p) => new URL(picKey(p), self.location.origin).href))
      for (const r of await pics.keys()) if (!keep.has(r.url)) await pics.delete(r)
      await self.clients.claim()
    })(),
  )
})

/** Cache these pictures if they are this version's and not cached yet (from src/pwa.ts: pictures loaded before this
 * worker was in charge, and a chapter's panels ahead of it). */
const cachePics = (urls) =>
  caches.open(PIC_CACHE).then((c) =>
    Promise.all(
      urls.map((u) => {
        let path
        try {
          const url = new URL(u, self.location.origin)
          if (url.origin !== self.location.origin) return null
          path = url.pathname
        } catch {
          return null
        }
        if (!PICS[path]) return null
        return c.match(picKey(path)).then((hit) =>
          hit ? null : fresh(path).then((res) => keepPic(c, path, res), () => null),
        )
      }),
    ),
  )

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data && event.data.type === 'CACHE_PICS' && Array.isArray(event.data.urls)) event.waitUntil(cachePics(event.data.urls))
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (req.mode === 'navigate') {
    if (url.pathname === '/' || url.pathname === '/index.html')
      event.respondWith(caches.match('./', { cacheName: CACHE }).then((hit) => hit ?? fetch(req)))
    return
  }
  if (PICS[url.pathname]) {
    event.respondWith(
      caches.open(PIC_CACHE).then((c) =>
        c.match(picKey(url.pathname)).then(
          (hit) =>
            hit ??
            fresh(url.pathname).then((res) => {
              event.waitUntil(keepPic(c, url.pathname, res.clone()).catch(() => {}))
              return res
            }),
        ),
      ),
    )
    return
  }
  event.respondWith(caches.match(req, { cacheName: CACHE, ignoreSearch: true }).then((hit) => hit ?? fetch(req)))
})
