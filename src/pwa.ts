/**
 * The service worker's page side (EVAL-7, kept for Retake). Production builds only: it registers /sw.js, checks
 * for a new version when the page is shown again, and reports a waiting version to the screen,
 * which offers "Update". Nothing reloads on its own: the page reloads only after the player taps
 * it, and the take resumes on the screen it was on (src/take/store.ts). A window that did not tap, when another
 * window's tap has already switched versions, offers its own Update, which reloads it onto the new version.
 */
type Listener = (apply: () => void) => void
const listeners = new Set<Listener>()
let waiting: (() => void) | null = null

/** Calls `f` with the "apply the update" action whenever a new version is waiting. */
export function onUpdateReady(f: Listener) {
  listeners.add(f)
  if (waiting) f(waiting)
  return () => {
    listeners.delete(f)
  }
}

const tell = (urls: string[]) => {
  if (!import.meta.env.PROD || !urls.length || typeof navigator === 'undefined' || !navigator.serviceWorker) return
  void navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage({ type: 'CACHE_PICS', urls }))
}

/** Ask the worker to keep these pictures for offline play: a chapter's cutscene panels, ahead of it. Skipped when
 * the player's browser asks to save data. */
export function cacheAhead(urls: string[]) {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  if (!saveData) tell(urls)
}

export function registerServiceWorker() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator))
    return
  let applied = false
  const hadController = !!navigator.serviceWorker.controller
  const announce = (apply: () => void) => {
    waiting = apply
    for (const f of listeners) f(apply)
  }
  const offer = (w: ServiceWorker) =>
    announce(() => {
      applied = true
      w.postMessage({ type: 'SKIP_WAITING' })
    })
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (applied) location.reload()
    // another window's Update switched the version under this one: its own Update reloads it
    else if (hadController) announce(() => location.reload())
  })
  window.addEventListener('load', () => {
    // Ask the browser to keep the take's progress and its cached pictures when the phone runs short of space (P4's
    // 2 GB phone, FL-12). Chrome and Safari decide without asking the player; Firefox would ask, so in a Firefox tab
    // it is left to the installed app.
    if (matchMedia('(display-mode: standalone)').matches || !/Firefox\//.test(navigator.userAgent))
      void navigator.storage?.persisted?.().then((kept) => kept || navigator.storage.persist()).catch(() => {})
    // a first visit loads the opening's panels before the worker takes control, so they never pass through it: once
    // it is in charge, it is handed the pictures already loaded, and keeps them like any it serves itself
    tell(
      performance
        .getEntriesByType('resource')
        .map((e) => e.name)
        .filter((u) => u.startsWith(`${location.origin}/take/assets/`)),
    )
    void navigator.serviceWorker.register('/sw.js').then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting)
      reg.addEventListener('updatefound', () => {
        const w = reg.installing
        w?.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w)
        })
      })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void reg.update().catch(() => {})
      })
    })
  })
}
