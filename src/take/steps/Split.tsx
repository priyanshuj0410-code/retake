import { useId, useState } from 'react'
import { T, useLabel } from '../lang'
import { Question, Stats, Statkey, Voice } from '../parts'
import { Frame, useFx, type StepProps } from './common'
import { Row, Who } from './Row'

/** Split (first_take.step_split, Rukavat's own kind): tap a chore, then a person; a person tapped first takes the
 * first open chore, and a filled chore tapped comes free. The family's rows show a mark for each chore given. */
export function Split(props: StepProps) {
  const { s } = props
  const chores = s.chores!
  const [given, setGiven] = useState<Record<number, string>>({})
  const [held, setHeld] = useState<number | null>(null)
  const fx = useFx(s.world)
  const label = useLabel()
  const qid = useId()
  const person = (name: string) => s.people.find((p) => p.en === name)!
  const left = chores.length - Object.keys(given).length
  /** Chores to each person, the TV counted against them (first-take.md: "the TV counted for whoever gets it"). */
  const load = () => {
    const out: Record<string, number> = {}
    for (const [j, name] of Object.entries(given)) out[name] = (out[name] ?? 0) + (chores[+j][0] === 'TV' ? -1 : 1)
    return out
  }
  const give = (name: string) => {
    const j = held ?? chores.findIndex((_, k) => !(k in given))
    if (j < 0) return
    fx('fill')
    setGiven({ ...given, [j]: name })
    setHeld(null)
  }
  return (
    <Frame
      {...props}
      cls="rk-split js-split"
      button={left ? [`Share ${left} more`, `${left} और बाँटें`] : s.button}
      live={!left}
      commit={() => props.onCommit({ chores: load() })}
    >
      <Question s={s} id={qid} />
      <Voice s={s} />
      <div className="rk-card on-paper rk-sched">
        <div className="rk-slots" role="group" aria-labelledby={qid}>
          {chores.map(([en, hi], j) => {
            const p = j in given ? person(given[j]) : null
            return (
              <div className="slotwrap" key={en}>
                <button
                  className={`slot${p ? ' is-filled' : ''}${held === j ? ' is-target' : ''}`}
                  type="button"
                  data-tv={en === 'TV' ? '' : undefined}
                  aria-label={label(p ? [`${en}, ${p.en}`, `${hi}, ${p.hi}`] : [`${en}, empty`, `${hi}, ख़ाली`])}
                  aria-pressed={held === j}
                  onClick={() => {
                    if (p) {
                      fx('unpick')
                      const { [j]: _, ...rest } = given
                      setGiven(rest)
                    } else setHeld(held === j ? null : j)
                  }}
                >
                  <T as="b" t={[en, hi]} />
                  {p ? <Who p={p} tick /> : null}
                </button>
              </div>
            )
          })}
        </div>
      </div>
      <div className="at-end rk-family">
        <Statkey keys={s.keys} />
        <div className="rows is-compact" role="group" aria-labelledby={qid}>
          {s.people.map((p) => (
            <Row
              key={p.en}
              s={s}
              p={p}
              role={null}
              side={
                <>
                  <Stats keys={s.keys} vals={p.vals} />
                  <span className="rk-marks">
                    {Object.values(given)
                      .filter((n) => n === p.en)
                      .map((_, k) => (
                        <i key={k} />
                      ))}
                  </span>
                </>
              }
              onClick={() => give(p.en)}
            />
          ))}
        </div>
      </div>
    </Frame>
  )
}
