import { useState } from 'react'
import { Colleague, type ColleagueView } from './Colleague'
import { Button } from './Button'
import './tapcard.css'

export interface TapOrderLabels {
  hint: string
  undo: string
  /** Hidden words before an unnumbered card: "Choose as number 2:". */
  choose: (n: number) => string
  /** Hidden words before a numbered card: "Number 1, tap to take back:". */
  chosen: (n: number) => string
  said: (name: string, n: number) => string
  next: (n: number) => string
  taken: (name: string, n: number) => string
}

/**
 * Tap-to-order ranking: tap the colleagues in order of preference and each takes the next
 * number. With one left it takes the last number itself and the order commits (k - 1 taps for
 * k cards, no Confirm). Tapping a numbered card takes it back with every number after it;
 * Undo takes back the last tap. Every tap is announced in a polite live region. Cards are
 * native buttons, so Tab, Enter and Space work, and each card's name says its state.
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
  const undo = () => {
    const last = chosen[chosen.length - 1]
    if (last === undefined) return
    const next = chosen.slice(0, -1)
    setChosen(next)
    setLive(labels.taken(items[last].name, next.length + 1))
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
                <span className="tapcard__mark" aria-hidden="true">
                  {at >= 0 ? at + 1 : ''}
                </span>
                <span className="tapcard__sr">
                  {at >= 0 ? labels.chosen(at + 1) : labels.choose(chosen.length + 1)}
                </span>
                <Colleague c={c} />
              </button>
            </li>
          )
        })}
      </ul>
      <p className="tapcard__sr" aria-live="polite">
        {live}
      </p>
      {chosen.length > 0 ? (
        <Button kind="secondary" onClick={undo}>
          {labels.undo}
        </Button>
      ) : null}
    </>
  )
}
