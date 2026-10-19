import type { ReactNode } from 'react'
import './readinggrid.css'

export interface ReadingCardView {
  id: string
  label: string
  level: string
  zone: 'lean' | 'none' | 'unread'
  meaning: string
}

/**
 * "Your readings": one card per ground, label then the level in colour, then a one-line
 * meaning. The first card is wide and can hold more (the headline's bar and reasons). The level
 * colours are neutral (violet, ink, grey): none reads as good or bad, and none is green or red.
 */
export function ReadingGrid({
  items,
  label,
  first,
}: {
  items: ReadingCardView[]
  label: string
  first?: ReactNode
}) {
  return (
    <ul className="readinggrid" aria-label={label}>
      {items.map((it, i) => (
        <li
          className={i === 0 ? 'readinggrid__card readinggrid__card--wide' : 'readinggrid__card'}
          key={it.id}
        >
          <span className="readinggrid__label">{it.label}</span>
          <span className={`readinggrid__level readinggrid__level--${it.zone}`}>{it.level}</span>
          <span className="readinggrid__meaning">{it.meaning}</span>
          {i === 0 ? first : null}
        </li>
      ))}
    </ul>
  )
}
