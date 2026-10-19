import { useState } from 'react'
import { Button } from './Button'
import { Colleague, type ColleagueView } from './Colleague'
import { Stamp } from './Comic'
import './split.css'

/**
 * Share a fixed pool by tapping one number per colleague (0 up to a cap), not one tap per
 * unit: a 6-unit split among three takes two or three taps. Nothing starts chosen: every
 * colleague's stamp is an empty ring and no number is pressed until the player taps one, so the
 * card never looks answered before it is. A number that would share more than is left is
 * aria-disabled (focus stays on it). The split commits as soon as everything is shared (anyone
 * not given a number gets none); "Start again" clears it. The count left is a polite live
 * region.
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
  const [units, setUnits] = useState<(number | null)[]>(() => items.map(() => null))
  const used = units.reduce<number>((a, b) => a + (b ?? 0), 0)
  const left = pool - used
  const set = (i: number, k: number) => {
    if (k - (units[i] ?? 0) > left) return
    const next = units.slice()
    next[i] = k
    if (next.reduce<number>((a, b) => a + (b ?? 0), 0) === pool) onDone(next.map((u) => u ?? 0))
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
            <span className="split__who">
              <Colleague c={c} layout="row" eager={i === 0} />
              <Stamp>{units[i] === null ? undefined : units[i]}</Stamp>
            </span>
            <div className="split__chips" role="group" aria-label={c.name}>
              {chips.map((k) => (
                <button
                  type="button"
                  key={k}
                  className={units[i] === k ? 'split__chip split__chip--on' : 'split__chip'}
                  aria-pressed={units[i] === k}
                  aria-disabled={k - (units[i] ?? 0) > left}
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
      {units.some((u) => u !== null) ? (
        <Button kind="quiet" onClick={() => setUnits(items.map(() => null))}>
          {labels.clear}
        </Button>
      ) : null}
    </>
  )
}
