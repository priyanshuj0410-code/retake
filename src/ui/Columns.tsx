import type { ReactNode } from 'react'
import './columns.css'

/**
 * Two short blocks side by side from 600 px and on paper, stacked on phones (EVAL-12: an area's
 * questions and habits, so they read lighter). No frame, no colour.
 */
export function Columns({ items }: { items: ReactNode[] }) {
  return (
    <div className="columns">
      {items.map((it, i) => (
        <div className="columns__item" key={i}>
          {it}
        </div>
      ))}
    </div>
  )
}
