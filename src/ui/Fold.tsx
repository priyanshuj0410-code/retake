import type { ReactNode } from 'react'
import './fold.css'

/**
 * A section that folds: a native details element whose summary holds the section's h2, so the
 * result page is a list of areas rather than ten screens of text. The first is open by default.
 * Keyboard and screen readers get the native disclosure (Enter or Space toggles it).
 */
export function Fold({
  title,
  open,
  children,
}: {
  title: string
  open?: boolean
  children: ReactNode
}) {
  return (
    <details className="fold" open={open}>
      <summary className="fold__summary">
        <h2 className="fold__title">{title}</h2>
      </summary>
      <div className="fold__body">{children}</div>
    </details>
  )
}
