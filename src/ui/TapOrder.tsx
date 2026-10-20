import { useState } from 'react'
import { Colleague, type ColleagueView } from './Colleague'
import { Actions } from './Actions'
import { Button } from './Button'
import { Stamp } from './Comic'
import './tapcard.css'

export interface TapOrderLabels {
  hint: string
  /** The confirm button once every card is stamped: "Confirm this order". */
  lock: string
  /** Said when every card is stamped: "Every card is stamped. Confirm this order, or tap one to change it." */
  ready: string
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
 * is stamped with the next rank; with one left it takes the last rank itself. Nothing advances
 * on its own: once every card is stamped the player confirms with "Confirm this order" (owner
 * decision, 19 Oct 2026). Tapping a stamped card takes it back with every rank after it;
 * "Clear the stamps" lifts them all. Back reopens the card with the saved order (`initial`). Every tap is announced in a polite
 * live region. Cards are native buttons, so Tab, Enter and Space work, and each card's name
 * says its state.
 */
export function TapOrder({
  items,
  onDone,
  labels,
  initial,
}: {
  items: ColleagueView[]
  onDone: (order: number[]) => void
  labels: TapOrderLabels
  /** A saved order to show again, stamped (Back). */
  initial?: number[]
}) {
  const [chosen, setChosen] = useState<number[]>(() => initial?.slice() ?? [])
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
      setChosen([...next, ...items.map((_, j) => j).filter((j) => !next.includes(j))])
      setLive(`${labels.said(items[i].name, next.length)} ${labels.ready}`)
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
            <li key={`${i}-${c.name}`}>
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
        <Actions>
          {chosen.length === k ? (
            <Button onClick={() => onDone(chosen)}>{labels.lock}</Button>
          ) : null}
          <Button kind="quiet" onClick={clear}>
            {labels.clear}
          </Button>
        </Actions>
      ) : null}
    </>
  )
}
