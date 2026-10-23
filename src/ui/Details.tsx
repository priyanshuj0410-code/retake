import type { ReactNode } from 'react'
import './details.css'

/** The breakdown behind a tap: closed by default, so the screen shows only the headline. */
export function Details(props: { summary: string; children: ReactNode }) {
  return (
    <details className="details">
      <summary className="details__summary">{props.summary}</summary>
      <div className="details__body">{props.children}</div>
    </details>
  )
}
