import { useId, useState } from 'react'
import { say, useLabel, useLang } from '../lang'
import { Question, Stats, Statkey, Voice, spoken } from '../parts'
import { Frame, useFx, useShuffled, was, type StepProps } from './common'
import { Stick, Who } from './Row'

/** The batting order, first stage (first_take.step_order, Cricket's own kind): the order column fills from the top as
 * players are tapped in the tray; a placed player tapped goes back to the tray. */
export function Order(props: StepProps) {
  const { s } = props
  const tray = useShuffled(s.people)
  const [order, setOrder] = useState<string[]>(() => was(props, 'order')?.order ?? [])
  const locked = !!props.revisit
  const fx = useFx(s.world)
  const label = useLabel()
  const lang = useLang()
  const qid = useId()
  const person = (name: string) => s.people.find((p) => p.en === name)!
  const left = s.people.length - order.length
  return (
    <Frame
      {...props}
      cls="js-order"
      button={left ? [`Place ${left} more`, `${left} और रखें`] : s.button}
      live={!left}
      commit={() => props.onCommit({ order })}
    >
      <Question s={s} id={qid} />
      <Voice s={s} />
      <Statkey keys={s.keys} />
      <ol className="cr-order" aria-labelledby={qid}>
        {s.people.map((_, j) => {
          const p = order[j] ? person(order[j]) : null
          return (
            <li key={j}>
              <button
                className={`slot cr-pos${p ? ' is-filled' : ''}${j === order.length ? ' is-target' : ''}`}
                type="button"
                data-n={j + 1}
                aria-label={label(p ? [`${j + 1}, ${p.en}`, `${j + 1}, ${p.hi}`] : [`${j + 1}, empty`, `${j + 1}, ख़ाली`])}
                onClick={() => {
                  if (!p || locked) return
                  fx('unpick')
                  setOrder(order.filter((_, k) => k !== j))
                }}
              >
                <b className="cr-no" aria-hidden="true">
                  {j + 1}
                </b>
                {p ? (
                  <>
                    <Who p={p} />
                    <Stats keys={s.keys} vals={p.vals} />
                    <Stick />
                  </>
                ) : null}
              </button>
            </li>
          )
        })}
      </ol>
      <div className="cr-tray at-end" role="group" aria-label={label(['Players', 'खिलाड़ी'])}>
        {tray.map((p) => (
          <button
            key={p.en}
            className="row cr-mini"
            type="button"
            hidden={order.includes(p.en)}
            aria-label={label(spoken(s, p))}
            data-en={p.en}
            onClick={() => {
              if (locked || order.length >= s.people.length) return
              fx('fill')
              setOrder([...order, p.en])
            }}
          >
            <span className="face" style={{ backgroundImage: `url(${p.face})` }} aria-hidden="true" />
            <span className="who" aria-hidden="true">
              <span className="nm" lang={lang === 'hi' ? 'hi' : undefined}>
                {say(lang, [p.en, p.hi])}
              </span>
              <Stats keys={s.keys} vals={p.vals} />
            </span>
          </button>
        ))}
      </div>
    </Frame>
  )
}
