import { useState } from 'react'
import { Button } from './Button'
import { Colleague, type ColleagueView } from './Colleague'
import './tapcard.css'
import './pair.css'

/** Who gets the pool: a colleague's position, or "even". */
export type PairChoice = number | 'even'

/**
 * A share as a one-tap pair (EVAL-8, concept B1): two colleagues side by side and "Share them
 * evenly" under them. One tap chooses (the chosen card takes the stamped weight); nothing
 * advances on its own: "Lock in this choice" confirms, and a tap elsewhere changes it first.
 * Back reopens the card with the saved choice (`initial`). Cards are native buttons with
 * `aria-pressed`, and the choice is said in a polite live region.
 */
export function PairShare({
  items,
  onDone,
  labels,
  initial,
}: {
  items: ColleagueView[]
  onDone: (c: PairChoice) => void
  labels: {
    hint: string
    even: string
    lock: string
    chosen: (name: string) => string
    chosenEven: string
  }
  initial?: PairChoice
}) {
  const [choice, setChoice] = useState<PairChoice | null>(initial ?? null)
  const said =
    choice === null ? '' : choice === 'even' ? labels.chosenEven : labels.chosen(items[choice].name)
  return (
    <>
      <ul className="tapcards" aria-label={labels.hint}>
        {items.map((c, i) => (
          <li key={`${i}-${c.name}`}>
            <button
              type="button"
              className={choice === i ? 'tapcard tapcard--on' : 'tapcard'}
              aria-pressed={choice === i}
              onClick={() => setChoice(i)}
            >
              <Colleague c={c} eager />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={choice === 'even' ? 'pair__even pair__even--on' : 'pair__even'}
        aria-pressed={choice === 'even'}
        onClick={() => setChoice('even')}
      >
        {labels.even}
      </button>
      <p className="tapcard__sr" aria-live="polite">
        {said}
      </p>
      {choice !== null ? <Button onClick={() => onDone(choice)}>{labels.lock}</Button> : null}
    </>
  )
}
