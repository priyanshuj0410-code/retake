import { useEffect, useRef, type ReactNode } from 'react'
import './shell.css'

/**
 * The frame of every screen: the series line, the screen itself and the tab bar after it, so
 * nothing focusable comes before the main content. When `screen` changes, focus moves to the
 * new screen's heading.
 */
export function Shell(props: {
  meta: [string, string]
  screen: string
  children: ReactNode
  nav?: ReactNode
}) {
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    const h = main.current?.querySelector('h1') as HTMLElement | null
    if (h) {
      h.tabIndex = -1
      h.focus({ preventScroll: false })
    }
    window.scrollTo(0, 0)
  }, [props.screen])
  return (
    <div className="shell">
      <header className="shell__bar">
        <span className="shell__meta">{props.meta[0]}</span>
        <span className="shell__meta">{props.meta[1]}</span>
      </header>
      <main id="main" className="shell__main" ref={main}>
        {props.children}
      </main>
      {props.nav ? <footer className="shell__foot">{props.nav}</footer> : null}
    </div>
  )
}
