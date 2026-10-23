import { useEffect, useRef, type ReactNode } from 'react'
import './shell.css'

/**
 * The frame of every screen: an optional top line (the level pips, a number), the screen, the
 * tab bar, and the one Prototype chip (after the content in the page order, drawn at the top
 * right), which opens the prototype menu where every draft and sample note lives. When
 * `screen` changes, focus moves to the new screen's heading.
 */
export function Shell(props: {
  top?: ReactNode
  screen: string
  children: ReactNode
  nav?: ReactNode
  chip: string
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
      <div className="shell__bar">{props.top ? <span className="shell__meta">{props.top}</span> : null}</div>
      <main id="main" className="shell__main" ref={main}>
        {props.children}
      </main>
      {props.nav ? <footer className="shell__foot">{props.nav}</footer> : null}
      <a className="shell__chip" href="#/dev">
        {props.chip}
      </a>
    </div>
  )
}
