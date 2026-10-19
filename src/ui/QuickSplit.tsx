import { useState } from 'react'
import { Button } from './Button'
import { Colleague, type ColleagueView } from './Colleague'
import './split.css'

/**
 * Share a fixed pool by tapping one number per colleague (0 up to a cap), not one tap per
 * unit: a 6-unit split among three takes two or three taps. A number that would share more
 * than is left is aria-disabled (focus stays on it). The split commits as soon as everything
 * is shared; "Start again" clears it. The count left is a polite live region.
 */
export function QuickSplit({
  items,
  pool,
  cap,
  onDone,
  labels,
}: {
  items: ColleagueView[]
  pool: number
  cap: number
  onDone: (units: number[]) => void
  labels: { left: (n: number) => string; chip: (name: string, k: number) => string; clear: string }
}) {
  const [units, setUnits] = useState<number[]>(() => items.map(() => 0))
  const used = units.reduce((a, b) => a + b, 0)
  const left = pool - used
  const set = (i: number, k: number) => {
    if (k - units[i] > left) return
    const next = units.slice()
    next[i] = k
    if (next.reduce((a, b) => a + b, 0) === pool) onDone(next)
    else setUnits(next)
  }
  const chips = [...Array(Math.min(cap, pool) + 1).keys()]
  return (
    <>
      <p className="split__left" aria-live="polite">
        {labels.left(left)}
      </p>
      <ul className="split">
        {items.map((c, i) => (
          <li className="split__row" key={c.name}>
            <Colleague c={c} />
            <div className="split__chips" role="group" aria-label={c.name}>
              {chips.map((k) => (
                <button
                  type="button"
                  key={k}
                  className={units[i] === k ? 'split__chip split__chip--on' : 'split__chip'}
                  aria-pressed={units[i] === k}
                  aria-disabled={k - units[i] > left}
                  aria-label={labels.chip(c.name, k)}
                  onClick={() => set(i, k)}
                >
                  {k}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {used > 0 ? (
        <Button kind="secondary" onClick={() => setUnits(items.map(() => 0))}>
          {labels.clear}
        </Button>
      ) : null}
    </>
  )
}
