import { useId, useState } from 'react'
import { T, useLabel, useLang, say } from '../lang'
import { Question, Stats, Statkey, Voice, spoken } from '../parts'
import { Svg } from '../Svg'
import { Frame, useFx, useShuffled, was, type StepProps } from './common'

/** Pick one, and Believe (the same card with the person's own account as the line); with s.max, spend checks: each
 * tapped card takes a check, up to the max (first_take.step_pick). */
export function Pick(props: StepProps) {
  const { s } = props
  const many = s.kind === 'checks' ? s.max! : 0
  const people = useShuffled(s.people)
  const locked = !!props.revisit
  const [on, setOn] = useState<string[]>(() => (many ? (was(props, 'set')?.set ?? []) : [was(props, 'pick')?.pick].filter((x): x is string => !!x)))
  const label = useLabel()
  const lang = useLang()
  const fx = useFx(s.world)
  const qid = useId()
  const tap = (name: string) => {
    if (locked) return
    const had = on.includes(name)
    if (many) {
      if (!had && on.length >= many) return
      fx(had ? 'spend' : 'tap')
      setOn(had ? on.filter((x) => x !== name) : [...on, name])
    } else {
      fx(had ? 'unpick' : 'tap')
      setOn(had ? [] : [name])
    }
  }
  const picked = s.people.find((p) => p.en === on[0])
  const button: [string, string] = many
    ? on.length
      ? s.button
      : ['Take up at least one', 'कम से कम एक चुनें']
    : picked
      ? [s.button[0].replace('{n}', picked.en), s.button[1].replace('{n}', picked.hi)]
      : ['Pick one', 'किसी एक को चुनें']
  return (
    <Frame
      {...props}
      cls={many ? 'js-checks' : 'js-pick'}
      button={button}
      live={on.length > 0}
      commit={() => props.onCommit(many ? { set: on } : { pick: on[0] ?? null })}
    >
      <Question s={s} id={qid} />
      <Voice s={s} />
      <Statkey keys={s.keys} />
      <div className="tiles" data-n={people.length} role={many ? 'group' : 'radiogroup'} aria-labelledby={qid}>
        {people.map((p, j) => {
          const sel = on.includes(p.en)
          const lid = `${qid}-${j}`
          return (
            <button
              key={p.en}
              className={`tile${s.teller ? ' jd-teller' : ''}${sel ? ' is-selected' : ''}`}
              type="button"
              role={many ? 'checkbox' : 'radio'}
              aria-checked={sel}
              aria-label={label(spoken(s, p))}
              aria-describedby={p.line ? lid : undefined}
              onClick={() => tap(p.en)}
            >
              <span className="tick" aria-hidden="true">
                <Svg name="tick" />
              </span>
              <span className="armmark" aria-hidden="true">
                <Svg name="arrow" />
              </span>
              <span className="lockmark" aria-hidden="true">
                <Svg name="lock" />
              </span>
              <span className="face" style={{ backgroundImage: `url(${p.face})` }} aria-hidden="true" />
              <span className="nmrow" aria-hidden="true">
                <span className="nm" lang={lang === 'hi' ? 'hi' : undefined}>
                  {say(lang, [p.en, p.hi])}
                </span>
                {p.serial ? (
                  <span className="serial" aria-hidden="true">
                    <T t={['No.', 'क्र.']} /> {p.serial}
                  </span>
                ) : null}
              </span>
              <Stats keys={s.keys} vals={p.vals} />
              {p.line ? <T t={p.line} className="note" id={lid} /> : null}
            </button>
          )
        })}
      </div>
    </Frame>
  )
}
