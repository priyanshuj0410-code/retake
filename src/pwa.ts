/**
 * The service worker's page side (EVAL-7, kept for Retake). Production builds only: it registers /sw.js, checks
 * for a new version when the page is shown again, and reports a waiting version to the screen,
 * which offers "Update". Nothing reloads on its own: the page reloads only after the player taps
 * it, and the take resumes on the screen it was on (src/take/store.ts).
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

export function registerServiceWorker() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator))
    return
  let applied = false
  const offer = (w: ServiceWorker) => {
    waiting = () => {
      applied = true
      w.postMessage({ type: 'SKIP_WAITING' })
    }
    for (const f of listeners) f(waiting)
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (applied) location.reload()
  })
  window.addEventListener('load', () => {
    // Installed, ask the browser to keep the take's progress and its cached pictures when the phone runs short of
    // space (P4's 2 GB phone, FL-12). Chrome grants this to an installed app without asking the player.
    if (matchMedia('(display-mode: standalone)').matches) void navigator.storage?.persist?.().catch(() => {})
    // a first visit loads the opening's panels before the worker takes control, so they never pass through it: once
    // it is in charge, it is handed what was already loaded, and caches it like any panel it serves itself
    void navigator.serviceWorker.ready.then((reg) => {
      const seen = performance
        .getEntriesByType('resource')
        .map((e) => e.name)
        .filter((u) => u.startsWith(`${location.origin}/take/`))
      reg.active?.postMessage({ type: 'CACHE_SEEN', urls: seen })
    })
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
