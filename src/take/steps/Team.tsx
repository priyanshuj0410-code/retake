import { useId, useState } from 'react'
import { Question, Statkey, Voice } from '../parts'
import { Frame, useFx, useShuffled, type StepProps } from './common'
import { Row, refuseOnce } from './Row'

/** Pick a team, and Keep: N of the people, as rows (first_take.step_team). A tap past N is refused in place. */
export function Team(props: StepProps) {
  const { s } = props
  const need = s.need!
  const people = useShuffled(s.people)
  const [on, setOn] = useState<string[]>([])
  const [refused, setRefused] = useState<string | null>(null)
  const fx = useFx(s.world)
  const qid = useId()
  const tap = (name: string) => {
    if (on.includes(name)) {
      fx('unpick')
      setOn(on.filter((x) => x !== name))
    } else if (on.length >= need) {
      fx('refuse')
      refuseOnce(setRefused, name)
    } else {
      fx('tap')
      setOn([...on, name])
    }
  }
  const left = need - on.length
  return (
    <Frame
      {...props}
      cls="js-multi"
      button={left > 0 ? [`Pick ${left} more`, `${left} और चुनें`] : s.button}
      live={left <= 0}
      commit={() => props.onCommit({ set: on })}
    >
      <Question s={s} id={qid} />
      <Voice s={s} />
      <Statkey keys={s.keys} />
      <div className="rows is-compact" role="group" aria-labelledby={qid}>
        {people.map((p) => (
          <Row key={p.en} s={s} p={p} checked={on.includes(p.en)} refused={refused === p.en} onClick={() => tap(p.en)} />
        ))}
      </div>
    </Frame>
  )
}
