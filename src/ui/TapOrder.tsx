import { useState } from 'react'
import { Colleague, type ColleagueView } from './Colleague'
import { Button } from './Button'
import { Stamp } from './Comic'
import './tapcard.css'

export interface TapOrderLabels {
  hint: string
  /** The quiet action that lifts every stamp: "Clear the stamps". */
  clear: string
  /** Said when the stamps are cleared: "Stamps cleared. Choose number 1." */
  cleared: string
  /** The words on a stamp: "1st". */
  stamp: (n: number) => string
  /** Hidden words before an unnumbered card: "Choose as number 2:". */
  choose: (n: number) => string
  /** Hidden words before a numbered card: "Number 1, tap to take back:". */
  chosen: (n: number) => string
  said: (name: string, n: number) => string
  next: (n: number) => string
  taken: (name: string, n: number) => string
}

/**
 * Tap-to-order ranking as portrait panels: tap the colleagues in order of preference and each
 * is stamped with the next rank. With one left it takes the last rank itself and the order
 * commits (k - 1 taps for k cards, no Confirm). Tapping a stamped card takes it back with
 * every rank after it; "Clear the stamps" lifts them all. Every tap is announced in a polite
 * live region. Cards are native buttons, so Tab, Enter and Space work, and each card's name
 * says its state.
 */
export function TapOrder({
  items,
  onDone,
  labels,
}: {
  items: ColleagueView[]
  onDone: (order: number[]) => void
  labels: TapOrderLabels
}) {
  const [chosen, setChosen] = useState<number[]>([])
  const [live, setLive] = useState('')
  const k = items.length
  const tap = (i: number) => {
    const at = chosen.indexOf(i)
    if (at >= 0) {
      const next = chosen.slice(0, at)
      setChosen(next)
      setLive(labels.taken(items[i].name, next.length + 1))
      return
    }
    const next = [...chosen, i]
    if (next.length >= k - 1) {
      onDone([...next, ...items.map((_, j) => j).filter((j) => !next.includes(j))])
      return
    }
    setChosen(next)
    setLive(`${labels.said(items[i].name, next.length)} ${labels.next(next.length + 1)}`)
  }
  const clear = () => {
    setChosen([])
    setLive(labels.cleared)
  }
  return (
    <>
      <ul className="tapcards" aria-label={labels.hint}>
        {items.map((c, i) => {
          const at = chosen.indexOf(i)
          return (
            <li key={c.name}>
              <button
                type="button"
                className={at >= 0 ? 'tapcard tapcard--on' : 'tapcard'}
                aria-pressed={at >= 0}
                onClick={() => tap(i)}
              >
                <span className="tapcard__sr">
                  {at >= 0 ? labels.chosen(at + 1) : labels.choose(chosen.length + 1)}
                </span>
                <Colleague c={c} eager={i < 2} />
                {at >= 0 ? (
                  <span className="tapcard__stamp">
                    <Stamp>{labels.stamp(at + 1)}</Stamp>
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="tapcard__sr" aria-live="polite">
        {live}
      </p>
      {chosen.length > 0 ? (
        <Button kind="quiet" onClick={clear}>
          {labels.clear}
        </Button>
      ) : null}
    </>
  )
}
