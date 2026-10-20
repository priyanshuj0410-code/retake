/**
 * The service worker's page side (EVAL-7). Production builds only: it registers /sw.js, checks
 * for a new version when the page is shown again, and reports a waiting version to the screen,
 * which offers "Update". Nothing reloads on its own: the page reloads only after the player taps
 * it, and a puzzle in progress resumes from this device's save (src/store/index.ts).
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
