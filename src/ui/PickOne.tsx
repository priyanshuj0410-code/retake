import { Colleague, type ColleagueView } from './Colleague'
import './tapcard.css'

/** One colleague of two or more: a tap on a card commits the choice at once (no Next). */
export function PickOne({
  items,
  onPick,
  label,
  hint,
}: {
  items: ColleagueView[]
  onPick: (i: number) => void
  /** Hidden words before each card: "Choose". */
  label: string
  hint: string
}) {
  return (
    <ul className="tapcards" aria-label={hint}>
      {items.map((c, i) => (
        <li key={c.name}>
          <button type="button" className="tapcard" onClick={() => onPick(i)}>
            <span className="tapcard__sr">{label}</span>
            <Colleague c={c} />
          </button>
        </li>
      ))}
    </ul>
  )
}
