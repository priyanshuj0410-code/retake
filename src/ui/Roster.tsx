import { Portrait } from './Portrait'
import './roster.css'

export interface RosterItem {
  figure: string
  figureLabel: string
  badge?: string
  name: string
  lines: string[]
}

/**
 * The season's cast with their running track records. Collapsed under its title on decision
 * screens (one tap to open, so it never pushes the decision down), open on the reveal and the
 * season's end.
 */
export function Roster({
  title,
  items,
  open,
  large,
}: {
  title: string
  items: RosterItem[]
  open?: boolean
  /** Large portraits (the reveal). */
  large?: boolean
}) {
  const list = (
    <ul className="roster">
      {items.map((it) => (
        <li className="roster__row" key={it.name}>
          <Portrait
            figure={it.figure}
            label={it.figureLabel}
            badge={it.badge}
            size={large ? 'large' : 'small'}
          />
          <span className="roster__who">
            <span className="roster__name">{it.name}</span>
            {it.lines.map((l, i) => (
              <span className="roster__line" key={`${i}-${l}`}>
                {l}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  )
  if (open)
    return (
      <section className="roster__panel" aria-label={title}>
        {list}
      </section>
    )
  return (
    <details className="roster__panel">
      <summary className="roster__summary">{title}</summary>
      {list}
    </details>
  )
}
