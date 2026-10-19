import type { ReactNode } from 'react'
import './details.css'

/**
 * "Read the full details": a native details element, closed by default, that holds the full
 * text behind a screen's short points (consent, the content note, the result's band). Nothing in
 * it is cut: the screen shows the scannable version and this keeps the complete one one tap
 * away. Enter or Space toggles it; the summary is a 48 px target on the note register's pitch.
 */
export function Details({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="details">
      <summary className="details__summary">{summary}</summary>
      <div className="details__body">{children}</div>
    </details>
  )
}
