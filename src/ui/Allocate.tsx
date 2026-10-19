import { Character, type CharacterView } from './Character'
import './allocate.css'

export interface AllocateProps {
  items: CharacterView[]
  /** Positions on screen: order[p] is the index in items shown at position p. */
  order: number[]
  units: number[]
  pool: number
  onChange: (units: number[]) => void
  labels: {
    add: (name: string) => string
    remove: (name: string) => string
    left: (n: number) => string
    done: string
    unit: string
  }
}

export function Allocate({ items, order, units, pool, onChange, labels }: AllocateProps) {
  const used = units.reduce((a, b) => a + b, 0)
  const left = pool - used
  /* The steppers are aria-disabled, not disabled, so focus stays on a spent plus. */
  const set = (i: number, d: number) => {
    if ((d > 0 && left === 0) || units[i] + d < 0) return
    const next = units.slice()
    next[i] = Math.max(0, next[i] + d)
    onChange(next)
  }
  return (
    <>
      <p
        className={left === 0 ? 'alloc__left alloc__left--done' : 'alloc__left'}
        aria-live="polite"
      >
        {left === 0 ? labels.done : labels.left(left)}
      </p>
      <ul className="alloc">
        {order.map((i) => (
          <li className="alloc__row" key={i}>
            <div className="alloc__body">
              <Character c={items[i]} />
            </div>
            <div className="alloc__controls">
              <button
                type="button"
                className="alloc__step"
                onClick={() => set(i, -1)}
                aria-disabled={units[i] === 0}
                aria-label={labels.remove(items[i].name)}
              >
                −
              </button>
              <span
                className="alloc__count"
                aria-label={`${items[i].name}: ${units[i]} ${labels.unit}`}
              >
                {units[i]}
              </span>
              <button
                type="button"
                className="alloc__step"
                onClick={() => set(i, 1)}
                aria-disabled={left === 0}
                aria-label={labels.add(items[i].name)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
